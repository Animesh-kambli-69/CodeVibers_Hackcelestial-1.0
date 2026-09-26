/**
 * Digital Twin Service.
 * Orchestrates the Weather-Driven Digital Twin: builds a live "twin" of the resort
 * (real occupancy/cancellation/demand state + live weather + real social signals),
 * and runs read-only what-if simulations through the existing Decision Engine.
 *
 * Nothing here writes to rooms/bookings/guests. Simulations are pure — the same
 * guarantee the Decision Engine itself makes (decision-engine/index.js).
 */
const { generateRecommendations } = require('../decision-engine');
const { simulateWeatherImpact, applyImpactToState } = require('../decision-engine/rules/weatherImpactRule');
const { PredictionStatus } = require('../models/enums');
const env = require('../config/env');
const logger = require('../utils/logger');

class DigitalTwinService {
  constructor({
    weatherService,
    socialSignalService,
    weatherRepository,
    socialSignalRepository,
    digitalTwinRepository,
    forecastService,
    cancellationService,
    roomDemandService,
    kpiService,
    staffingService,
    aiService,
  }) {
    this.weatherService = weatherService;
    this.socialSignalService = socialSignalService;
    this.weatherRepository = weatherRepository;
    this.socialSignalRepository = socialSignalRepository;
    this.digitalTwinRepository = digitalTwinRepository;
    this.forecastService = forecastService;
    this.cancellationService = cancellationService;
    this.roomDemandService = roomDemandService;
    this.kpiService = kpiService;
    this.staffingService = staffingService;
    this.aiService = aiService;
  }

  /**
   * Live weather (current + forecast), cached in Postgres, degrading gracefully
   * to the last known snapshot when the live API is unreachable.
   */
  async getWeather(days = 7) {
    try {
      const result = await this.weatherService.getCurrentAndForecast(days);

      if (this.weatherRepository) {
        const toSave = [];
        if (result.current) {
          toSave.push({
            latitude: result.latitude,
            longitude: result.longitude,
            isForecast: false,
            temperatureC: result.current.temperatureC,
            feelsLikeC: result.current.feelsLikeC,
            precipitationMm: result.current.precipitationMm,
            windSpeedKmh: result.current.windSpeedKmh,
            weatherCode: result.current.weatherCode,
            condition: result.current.condition,
            raw: result.current,
          });
        }
        for (const day of result.forecast) {
          toSave.push({
            latitude: result.latitude,
            longitude: result.longitude,
            isForecast: true,
            forecastDate: day.date,
            temperatureC: day.temperatureMaxC,
            feelsLikeC: null,
            precipitationMm: day.precipitationMm,
            windSpeedKmh: day.windSpeedMaxKmh,
            weatherCode: day.weatherCode,
            condition: day.condition,
            raw: day,
          });
        }
        this.weatherRepository.saveBatch(toSave).catch((err) => {
          logger.warn({ error: err.message }, 'Failed to persist weather snapshot cache');
        });
      }

      return {
        status: PredictionStatus.AVAILABLE,
        latitude: result.latitude,
        longitude: result.longitude,
        current: result.current,
        forecast: result.forecast,
      };
    } catch (err) {
      logger.warn({ error: err.message }, 'Live weather fetch failed, falling back to cache');
      return this._weatherFromCache(days);
    }
  }

  async _weatherFromCache(days) {
    if (!this.weatherRepository) {
      return { status: PredictionStatus.UNAVAILABLE, current: null, forecast: [] };
    }
    const [current, forecast] = await Promise.all([
      this.weatherRepository.findLatestCurrent(),
      this.weatherRepository.findLatestForecast(days),
    ]);
    if (!current && forecast.length === 0) {
      return { status: PredictionStatus.UNAVAILABLE, current: null, forecast: [] };
    }
    return {
      status: PredictionStatus.STALE,
      latitude: env.RESORT_LATITUDE,
      longitude: env.RESORT_LONGITUDE,
      current: current
        ? {
            capturedAt: current.capturedAt,
            temperatureC: current.temperatureC,
            feelsLikeC: current.feelsLikeC,
            precipitationMm: current.precipitationMm,
            windSpeedKmh: current.windSpeedKmh,
            weatherCode: current.weatherCode,
            condition: current.condition,
          }
        : null,
      forecast: forecast.map((f) => ({
        date: f.forecastDate,
        temperatureMaxC: f.temperatureC,
        precipitationMm: f.precipitationMm,
        windSpeedMaxKmh: f.windSpeedKmh,
        weatherCode: f.weatherCode,
        condition: f.condition,
      })),
    };
  }

  /**
   * Real-world public social signals related to weather/travel near the resort,
   * cached in Postgres for graceful degradation (Reddit rate-limits anonymous callers).
   */
  async getSocialSignals(query, limit = 15) {
    try {
      const items = await this.socialSignalService.fetchSignals(query, limit);
      if (this.socialSignalRepository && items.length > 0) {
        this.socialSignalRepository.saveBatch(items).catch((err) => {
          logger.warn({ error: err.message }, 'Failed to persist social signal cache');
        });
      }
      return { status: PredictionStatus.AVAILABLE, items };
    } catch (err) {
      logger.warn({ error: err.message }, 'Live social signal fetch failed, falling back to cache');
      if (!this.socialSignalRepository) {
        return { status: PredictionStatus.UNAVAILABLE, items: [] };
      }
      const cached = await this.socialSignalRepository.findRecent(limit);
      return { status: cached.length > 0 ? PredictionStatus.STALE : PredictionStatus.UNAVAILABLE, items: cached };
    }
  }

  /**
   * Builds the resort state the Decision Engine already understands
   * (same shape recommendationService.js uses) — this is the twin's "ground truth".
   */
  async _buildBaselineState() {
    const [occupancyForecastResult, cancellationSummary, roomDemands, kpis, departmentStaffing] = await Promise.all([
      this.forecastService.getOccupancyForecast(7),
      this.cancellationService.getManagerSummary(30),
      this.roomDemandService.getRoomDemands(30),
      this.kpiService.getManagerKpis(),
      this.staffingService ? this.staffingService.getDepartmentStaffing() : Promise.resolve([]),
    ]);

    const housekeeping = departmentStaffing.find((d) => d.department === 'Housekeeping');

    return {
      occupancyForecast: { predictions: occupancyForecastResult.forecast },
      cancellationSummary,
      roomDemands,
      kpis,
      departmentStaffing,
      staff: {
        // Weather cascades operational load onto Housekeeping specifically
        // (see weatherImpactRule.js housekeepingLoadDeltaStaffHours) — sourced
        // from the real staff_members roster via staffingService, not mocked.
        housekeepingRequired: housekeeping ? housekeeping.required : 0,
        housekeepingAvailable: housekeeping ? housekeeping.available : 0,
      },
    };
  }

  /**
   * Current Digital Twin snapshot: live weather + real resort state + social sentiment,
   * with the baseline (un-simulated) recommendations the Decision Engine already produces.
   */
  async getCurrentState() {
    const [weather, social, baselineState] = await Promise.all([
      this.getWeather(7),
      this.getSocialSignals(undefined, 10),
      this._buildBaselineState(),
    ]);

    const baselineSeverity =
      weather.current && weather.status !== PredictionStatus.UNAVAILABLE
        ? simulateWeatherImpact({
            precipitationMm: weather.current.precipitationMm || 0,
            windSpeedKmh: weather.current.windSpeedKmh || 0,
            temperatureC: weather.current.temperatureC ?? 25,
            stormDurationHrs: 0,
            flooding: false,
          }).severity
        : 'UNKNOWN';

    const recommendations = generateRecommendations(baselineState);

    return {
      weather,
      social,
      resort: baselineState,
      currentWeatherSeverity: baselineSeverity,
      recommendations: recommendations.slice(0, 10),
    };
  }

  /**
   * What-if / counterfactual simulation. Never mutates real bookings/rooms/staff —
   * runs entirely on an in-memory clone of the current resort state.
   */
  async simulateWhatIf(params, { userId = null, label = null } = {}) {
    const baselineState = await this._buildBaselineState();
    const baselineRecommendations = generateRecommendations(baselineState);

    const impact = simulateWeatherImpact(params);
    const simulatedState = applyImpactToState(baselineState, impact);
    const simulatedRecommendations = generateRecommendations(simulatedState);

    const impactSummary = this._diffStates(baselineState, simulatedState, {
      baselineRecommendations,
      simulatedRecommendations,
    });

    let narrative = null;
    if (this.aiService) {
      try {
        narrative = await this.aiService.generateWeatherImpactNarrative({
          scenarioParams: params,
          impact,
          impactSummary,
          recommendations: simulatedRecommendations,
        });
      } catch (err) {
        logger.warn({ error: err.message }, 'Weather narrative generation failed');
      }
    }

    let scenarioId = null;
    if (this.digitalTwinRepository) {
      try {
        const saved = await this.digitalTwinRepository.saveScenario({
          createdBy: userId,
          label,
          scenarioParams: params,
          baselineState,
          simulatedState,
          impactSummary,
          recommendations: simulatedRecommendations,
          narrative,
        });
        scenarioId = saved.id;
      } catch (err) {
        logger.warn({ error: err.message }, 'Failed to persist digital twin scenario');
      }
    }

    return {
      scenarioId,
      params,
      impact,
      baseline: {
        currentOccupancy: baselineState.kpis.currentOccupancy,
        cancellationSummary: baselineState.cancellationSummary,
        roomDemands: baselineState.roomDemands,
        recommendationCount: baselineRecommendations.length,
      },
      simulated: {
        currentOccupancy: simulatedState.kpis.currentOccupancy,
        cancellationSummary: simulatedState.cancellationSummary,
        roomDemands: simulatedState.roomDemands,
        recommendationCount: simulatedRecommendations.length,
      },
      impactSummary,
      recommendations: simulatedRecommendations,
      narrative,
    };
  }

  _diffStates(baseline, simulated, { baselineRecommendations, simulatedRecommendations }) {
    const baselineKeys = new Set(baselineRecommendations.map((r) => r.dedupKey || r.title));
    const newRecommendations = simulatedRecommendations.filter(
      (r) => !baselineKeys.has(r.dedupKey || r.title)
    );

    return {
      occupancy: {
        before: baseline.kpis.currentOccupancy,
        after: simulated.kpis.currentOccupancy,
        deltaPct: round2(simulated.kpis.currentOccupancy - baseline.kpis.currentOccupancy),
      },
      cancellation: {
        before: baseline.cancellationSummary.averageProbability,
        after: simulated.cancellationSummary.averageProbability,
        highRiskCountBefore: baseline.cancellationSummary.highRiskCount,
        highRiskCountAfter: simulated.cancellationSummary.highRiskCount,
      },
      staffing: {
        housekeepingRequiredBefore: baseline.staff.housekeepingRequired,
        housekeepingRequiredAfter: simulated.staff.housekeepingRequired,
      },
      newRecommendationCount: newRecommendations.length,
      newRecommendationTitles: newRecommendations.map((r) => r.title),
    };
  }
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

module.exports = DigitalTwinService;
