/**
 * Rule R1: High Occupancy Forecast Alert.
 * Triggered when predicted occupancy exceeds highOccupancyThreshold (default 85%).
 */
const RULE_CONFIG = require('../config/thresholds');
const { RecommendationCategory, RecommendationPriority } = require('../../models/enums');

function evaluateOccupancyRule(state, config = RULE_CONFIG) {
  const recommendations = [];
  const forecast = state.occupancyForecast;

  if (!forecast || !forecast.predictions || forecast.predictions.length === 0) {
    return recommendations;
  }

  const threshold = config.highOccupancyThreshold;

  for (const day of forecast.predictions) {
    if (day.predictedOccupancy >= threshold) {
      recommendations.push({
        ruleId: 'R1',
        category: RecommendationCategory.OCCUPANCY,
        title: `High Occupancy Alert for ${day.date}`,
        reason: `Predicted occupancy is ${day.predictedOccupancy}% on ${day.date} (${day.dayOfWeek}), exceeding the ${threshold}% operational threshold.`,
        suggestedAction: `Prepare front-desk staff, ensure housekeeping readiness, and review dining inventory for high guest volume.`,
        priority: RecommendationPriority.HIGH,
        confidence: 0.9,
        sourceData: {
          date: day.date,
          predictedOccupancy: day.predictedOccupancy,
          threshold,
        },
        dedupKey: `R1:${day.date}`,
      });
    }
  }

  return recommendations;
}

module.exports = evaluateOccupancyRule;
