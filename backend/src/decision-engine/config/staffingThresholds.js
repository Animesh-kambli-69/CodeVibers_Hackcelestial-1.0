/**
 * Staffing workflow configuration (STAFFING_CONFIG).
 * Implements backend/docs/decision-engine.md §15 (Staff Optimization Workflow):
 *   Occupancy Forecast -> Expected Workload -> Required Staff -> Available Staff -> Shortage/Surplus.
 *
 * requiredStaffPerOccupiedRoom is staff headcount needed per occupied room for each
 * department, plus a fixed baseline that covers the resort regardless of occupancy
 * (e.g. front desk always needs a minimum crew). These are explicit, documented
 * assumptions — tune them here, not scattered through service code.
 */
const STAFFING_CONFIG = Object.freeze({
  departments: ['FRONT_DESK', 'HOUSEKEEPING', 'FOOD_BEVERAGE', 'SPA_WELLNESS'],

  baselineRequired: {
    FRONT_DESK: 4,
    HOUSEKEEPING: 4,
    FOOD_BEVERAGE: 6,
    SPA_WELLNESS: 3,
  },

  requiredStaffPerOccupiedRoom: {
    FRONT_DESK: 0.045,
    HOUSEKEEPING: 0.11,
    FOOD_BEVERAGE: 0.05,
    SPA_WELLNESS: 0.02,
  },

  // Shortage severity as a fraction of required staff.
  criticalShortageRatio: 0.20, // shortage >= 20% of required -> CRITICAL
});

module.exports = STAFFING_CONFIG;
