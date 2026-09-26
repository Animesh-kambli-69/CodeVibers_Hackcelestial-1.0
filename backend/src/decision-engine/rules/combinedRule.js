/**
 * Rule R9: High Occupancy + High Cancellation Risk.
 * Triggered when high forecasted occupancy coincides with a significant volume of high-risk bookings.
 */
const RULE_CONFIG = require('../config/thresholds');
const { RecommendationCategory, RecommendationPriority } = require('../../models/enums');

function evaluateCombinedRule(state, config = RULE_CONFIG) {
  const recommendations = [];
  const forecast = state.occupancyForecast;
  const cancellationSummary = state.cancellationSummary;

  if (!forecast || !forecast.predictions || !cancellationSummary) {
    return recommendations;
  }

  const hasHighOccupancyDays = forecast.predictions.some(
    (p) => p.predictedOccupancy >= config.highOccupancyThreshold
  );
  const hasHighCancellations = (cancellationSummary.highRiskCount || 0) >= config.highRiskCancellationCount;

  if (hasHighOccupancyDays && hasHighCancellations) {
    recommendations.push({
      ruleId: 'R9',
      category: RecommendationCategory.OCCUPANCY,
      title: 'Peak Occupancy at Risk due to Cancellations',
      reason: `Forecast predicts peak occupancy alongside ${cancellationSummary.highRiskCount} high-risk bookings. If cancelled without backfill, actual occupancy will drop sharply.`,
      suggestedAction: `Implement strict cancellation policies for the peak dates and activate last-minute booking promotional channels.`,
      priority: RecommendationPriority.CRITICAL,
      confidence: 0.9,
      sourceData: {
        highOccupancyThreshold: config.highOccupancyThreshold,
        highRiskCount: cancellationSummary.highRiskCount,
      },
      dedupKey: `R9:peak-risk-window`,
    });
  }

  return recommendations;
}

module.exports = evaluateCombinedRule;
