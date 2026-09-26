/**
 * Decision Engine business thresholds and rule configuration (RULE_CONFIG).
 * Single source of truth for business rules, risk classifications, and refresh intervals.
 */
const RULE_CONFIG = Object.freeze({
  // Refresh interval for recommendation recalculation on demand
  recommendationRefreshMinutes: 15,

  // Occupancy Thresholds
  highOccupancyThreshold: 85.0, // High occupancy alert threshold (%)
  lowOccupancyThreshold: 45.0,

  // Demand Bands (%)
  demandBands: {
    HIGH: 80.0,
    MEDIUM: 50.0,
    LOW: 0.0,
  },

  // Cancellation Risk Thresholds (Backend Authoritative: api.md §2)
  cancellationRisk: {
    HIGH: 0.70,   // >= 0.70
    MEDIUM: 0.40, // >= 0.40
    LOW: 0.0,     // < 0.40
  },

  // Rule specific thresholds
  highRiskCancellationCount: 10,     // Threshold for aggregate HIGH priority alert
  lowAvailableRoomCount: 5,          // Low room count trigger for R4

  // Recommendation Priorities
  priorities: {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  },
});

module.exports = RULE_CONFIG;
