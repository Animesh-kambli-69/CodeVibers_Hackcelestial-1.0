/**
 * Weather Digital Twin — impact coefficient table (WEATHER_CONFIG).
 *
 * This is the "learned relationship" between weather severity and resort behavior,
 * expressed the same way the rest of the Decision Engine expresses business rules:
 * as a single, explainable, configurable source of truth (see decision-engine.md §10,
 * "Central Rule Configuration") rather than an opaque model. Every number here is a
 * documented assumption a domain expert can review and tune — consistent with the
 * project's "Deterministic / Explainable / No hallucination" principles (§35).
 *
 * Coefficients are percentage-point deltas applied to the resort's live KPIs
 * (see kpiService.js), not absolute values — they represent how much a KPI should
 * move relative to its current baseline under a given weather severity band.
 */
const WEATHER_CONFIG = Object.freeze({
  // --- Severity classification bands ---
  precipitationBandsMm: { ADVISORY: 10, SEVERE: 40, EXTREME: 100 }, // rainfall in the simulated window
  windBandsKmh: { ADVISORY: 30, SEVERE: 60, EXTREME: 90 },
  heatBandsC: { ADVISORY: 38, SEVERE: 42, EXTREME: 45 },
  stormDurationEscalationHrs: { ADVISORY: 6, SEVERE: 12, EXTREME: 24 }, // duration alone can escalate severity

  severityOrder: ['NORMAL', 'ADVISORY', 'SEVERE', 'EXTREME'],

  // --- Direct effects (first-order: weather -> demand/cancellation) ---
  occupancyDeltaPctBySeverity: { NORMAL: 0, ADVISORY: -3, SEVERE: -12, EXTREME: -28 },
  cancellationProbabilityDeltaBySeverity: { NORMAL: 0, ADVISORY: 0.05, SEVERE: 0.18, EXTREME: 0.35 },
  bookingVelocityDeltaPctBySeverity: { NORMAL: 0, ADVISORY: -5, SEVERE: -20, EXTREME: -45 },

  // --- Cascading / secondary effects (weather -> occupancy stress -> operations) ---
  outdoorActivityDemandDeltaPctBySeverity: { NORMAL: 0, ADVISORY: -15, SEVERE: -55, EXTREME: -85 },
  spaWellnessDemandDeltaPctBySeverity: { NORMAL: 0, ADVISORY: 10, SEVERE: 30, EXTREME: 40 },
  inRoomDiningDemandDeltaPctBySeverity: { NORMAL: 0, ADVISORY: 5, SEVERE: 25, EXTREME: 45 },
  transportationDelayRiskPctBySeverity: { NORMAL: 0, ADVISORY: 10, SEVERE: 45, EXTREME: 80 },
  housekeepingLoadDeltaStaffHoursBySeverity: { NORMAL: 0, ADVISORY: 1, SEVERE: 4, EXTREME: 8 },

  // Extreme heat is a distinct axis from rain/storm severity: pool demand rises with
  // heat then collapses past a comfort threshold as guests retreat indoors.
  poolDemandDeltaPctByHeatSeverity: { NORMAL: 0, ADVISORY: 20, SEVERE: 10, EXTREME: -20 },

  // --- Flooding is treated as a discrete escalation + fixed penalty, not a band ---
  floodingSeverityEscalationSteps: 1,
  floodingOccupancyPctPenalty: -15,
  floodingCancellationProbabilityDelta: 0.20,

  // --- Uncertainty: wider confidence interval at higher severity (fewer historical
  // analogues, more volatile guest behavior) — surfaced so predictions are never
  // presented as point-certain (decision-engine.md: "probabilistic ... with uncertainty").
  uncertaintyPctBySeverity: { NORMAL: 2, ADVISORY: 5, SEVERE: 10, EXTREME: 18 },
});

module.exports = WEATHER_CONFIG;
