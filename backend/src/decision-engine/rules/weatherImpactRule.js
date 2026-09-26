/**
 * Weather Digital Twin — impact simulation.
 * Pure functions, zero I/O (matches decision-engine/index.js's guarantee).
 *
 * classifySeverity(): weather observation/forecast -> severity band.
 * simulateWeatherImpact(): severity -> direct + cascading effect deltas with uncertainty.
 * applyImpactToState(): baseline resort state + impact deltas -> a new, still-valid
 *   resort state that the existing Decision Engine (index.js) can evaluate unmodified.
 *
 * This last step is what makes it a *digital twin* rather than a bolt-on chart: the
 * simulated state re-enters the same occupancy/cancellation/staffing/demand rules
 * (occupancyRule.js, cancellationRule.js, roomDemandRule.js, combinedRule.js) that
 * already govern the real resort, so weather-driven recommendations are produced by
 * the same trusted, explainable pipeline — not a separate ad hoc code path.
 */
const WEATHER_CONFIG = require('../config/weatherThresholds');
const { demandLevel } = require('../classify');

function bandIndex(config, band) {
  return config.severityOrder.indexOf(band);
}

function bandForValue(value, bands, config) {
  if (value >= bands.EXTREME) return 'EXTREME';
  if (value >= bands.SEVERE) return 'SEVERE';
  if (value >= bands.ADVISORY) return 'ADVISORY';
  return 'NORMAL';
}

function worstBand(bandsList, config) {
  let worst = 'NORMAL';
  for (const b of bandsList) {
    if (bandIndex(config, b) > bandIndex(config, worst)) worst = b;
  }
  return worst;
}

/**
 * @param {{precipitationMm?: number, windSpeedKmh?: number, temperatureC?: number, stormDurationHrs?: number, flooding?: boolean}} weatherParams
 */
function classifySeverity(weatherParams = {}, config = WEATHER_CONFIG) {
  const precipitationMm = weatherParams.precipitationMm || 0;
  const windSpeedKmh = weatherParams.windSpeedKmh || 0;
  const temperatureC = weatherParams.temperatureC ?? 25;
  const stormDurationHrs = weatherParams.stormDurationHrs || 0;

  const bands = [
    bandForValue(precipitationMm, config.precipitationBandsMm, config),
    bandForValue(windSpeedKmh, config.windBandsKmh, config),
    bandForValue(temperatureC, config.heatBandsC, config),
    bandForValue(stormDurationHrs, config.stormDurationEscalationHrs, config),
  ];

  let severity = worstBand(bands, config);

  if (weatherParams.flooding) {
    const idx = Math.min(
      config.severityOrder.length - 1,
      bandIndex(config, severity) + config.floodingSeverityEscalationSteps
    );
    severity = config.severityOrder[idx];
  }

  return severity;
}

/**
 * Computes direct + cascading effect deltas and an uncertainty band for a given
 * weather scenario. Does not touch any resort state — pure transformation.
 */
function simulateWeatherImpact(weatherParams = {}, config = WEATHER_CONFIG) {
  const severity = classifySeverity(weatherParams, config);
  const flooding = !!weatherParams.flooding;

  const occupancyDeltaPct =
    config.occupancyDeltaPctBySeverity[severity] + (flooding ? config.floodingOccupancyPctPenalty : 0);
  const cancellationProbabilityDelta =
    config.cancellationProbabilityDeltaBySeverity[severity] +
    (flooding ? config.floodingCancellationProbabilityDelta : 0);
  const bookingVelocityDeltaPct = config.bookingVelocityDeltaPctBySeverity[severity];

  const heatSeverity = bandForValue(weatherParams.temperatureC ?? 25, config.heatBandsC, config);

  const uncertaintyPct = config.uncertaintyPctBySeverity[severity];

  return {
    severity,
    inputs: { ...weatherParams },
    direct: {
      occupancyDeltaPct: round2(occupancyDeltaPct),
      cancellationProbabilityDelta: round2(cancellationProbabilityDelta),
      bookingVelocityDeltaPct: round2(bookingVelocityDeltaPct),
    },
    cascading: {
      outdoorActivityDemandDeltaPct: config.outdoorActivityDemandDeltaPctBySeverity[severity],
      spaWellnessDemandDeltaPct: config.spaWellnessDemandDeltaPctBySeverity[severity],
      inRoomDiningDemandDeltaPct: config.inRoomDiningDemandDeltaPctBySeverity[severity],
      transportationDelayRiskPct: config.transportationDelayRiskPctBySeverity[severity],
      poolDemandDeltaPct: config.poolDemandDeltaPctByHeatSeverity[heatSeverity],
      housekeepingLoadDeltaStaffHours: config.housekeepingLoadDeltaStaffHoursBySeverity[severity],
    },
    uncertainty: {
      pct: uncertaintyPct,
      occupancyRange: {
        low: round2(occupancyDeltaPct - uncertaintyPct),
        high: round2(occupancyDeltaPct + uncertaintyPct),
      },
    },
  };
}

/**
 * Applies impact deltas to a baseline resort state, producing a new state object
 * shaped exactly like the real state the Decision Engine already evaluates
 * (see kpiService.js / forecastService.js output shapes). Values are clamped to
 * valid ranges. The baseline is never mutated.
 */
function applyImpactToState(baselineState, impact) {
  const state = JSON.parse(JSON.stringify(baselineState || {}));

  // Occupancy KPI + forecast
  if (state.kpis) {
    state.kpis.currentOccupancy = clamp(
      (state.kpis.currentOccupancy || 0) + impact.direct.occupancyDeltaPct,
      0,
      100
    );
  }
  if (state.occupancyForecast && Array.isArray(state.occupancyForecast.predictions)) {
    state.occupancyForecast.predictions = state.occupancyForecast.predictions.map((p) => ({
      ...p,
      predictedOccupancy: clamp((p.predictedOccupancy || 0) + impact.direct.occupancyDeltaPct, 0, 100),
    }));
  }

  // Cancellation summary: reallocate bookings across risk buckets by the probability
  // shift, keeping totalEvaluated fixed. A positive delta pushes bookings from
  // LOW -> MEDIUM -> HIGH; a negative delta (e.g. a "what would clear skies do?"
  // scenario) pulls them back.
  if (state.cancellationSummary) {
    const cs = state.cancellationSummary;
    const totalEvaluated = cs.totalEvaluated || 0;
    const delta = impact.direct.cancellationProbabilityDelta;
    const shiftCount = Math.round(totalEvaluated * Math.abs(delta));

    let low = cs.lowRiskCount || 0;
    let med = cs.mediumRiskCount || 0;
    let high = cs.highRiskCount || 0;

    if (delta > 0) {
      const toMed = Math.min(low, Math.ceil(shiftCount / 2));
      low -= toMed;
      med += toMed;
      const toHigh = Math.min(med, Math.floor(shiftCount / 2));
      med -= toHigh;
      high += toHigh;
    } else if (delta < 0) {
      const toMed = Math.min(high, Math.ceil(shiftCount / 2));
      high -= toMed;
      med += toMed;
      const toLow = Math.min(med, Math.floor(shiftCount / 2));
      med -= toLow;
      low += toLow;
    }

    cs.lowRiskCount = low;
    cs.mediumRiskCount = med;
    cs.highRiskCount = high;
    cs.averageProbability = round2(clamp((cs.averageProbability || 0) + delta, 0, 1));
  }

  // Room demand: recompute occupancy, booked/available split, and demand band so
  // rules R4/combined re-evaluate against genuinely shifted inventory pressure.
  if (Array.isArray(state.roomDemands)) {
    state.roomDemands = state.roomDemands.map((rd) => {
      const occupancyRatePct = clamp((rd.occupancyRatePct || 0) + impact.direct.occupancyDeltaPct, 0, 100);
      const totalRooms = rd.totalRooms || 0;
      const bookedRooms = Math.round((totalRooms * occupancyRatePct) / 100);
      const availableRooms = Math.max(0, totalRooms - bookedRooms);
      return {
        ...rd,
        occupancyRatePct: round2(occupancyRatePct),
        bookedRooms,
        availableRooms,
        demandLevel: demandLevel(occupancyRatePct),
      };
    });
  }

  // Staffing (housekeeping) — cascading operational load
  if (state.staff) {
    state.staff.housekeepingRequired =
      (state.staff.housekeepingRequired || 0) + Math.ceil(impact.cascading.housekeepingLoadDeltaStaffHours / 2);
  }

  state._weatherImpact = impact;
  return state;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

module.exports = {
  classifySeverity,
  simulateWeatherImpact,
  applyImpactToState,
};
