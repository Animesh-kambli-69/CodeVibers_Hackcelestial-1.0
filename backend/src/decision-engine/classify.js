/**
 * Pure classification functions for risk levels and occupancy demand bands.
 */
const RULE_CONFIG = require('./config/thresholds');
const { RiskLevel } = require('../models/enums');

function classifyRisk(probability) {
  if (probability === null || probability === undefined || isNaN(probability)) {
    return null;
  }
  if (probability >= RULE_CONFIG.cancellationRisk.HIGH) {
    return RiskLevel.HIGH;
  }
  if (probability >= RULE_CONFIG.cancellationRisk.MEDIUM) {
    return RiskLevel.MEDIUM;
  }
  return RiskLevel.LOW;
}

function demandLevel(occupancyPct) {
  if (occupancyPct === null || occupancyPct === undefined || isNaN(occupancyPct)) {
    return 'LOW';
  }
  if (occupancyPct >= RULE_CONFIG.demandBands.HIGH) {
    return 'HIGH';
  }
  if (occupancyPct >= RULE_CONFIG.demandBands.MEDIUM) {
    return 'MEDIUM';
  }
  return 'LOW';
}

module.exports = {
  classifyRisk,
  demandLevel,
};
