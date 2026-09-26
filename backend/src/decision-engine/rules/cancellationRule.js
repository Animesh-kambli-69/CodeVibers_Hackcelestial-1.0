/**
 * Rules R2 & R3: Cancellation Risk Alerts.
 * Aggregate recommendations for manager decision support (Decision C-14).
 */
const RULE_CONFIG = require('../config/thresholds');
const { RecommendationCategory, RecommendationPriority } = require('../../models/enums');

function evaluateCancellationRule(state, config = RULE_CONFIG) {
  const recommendations = [];
  const cancellationSummary = state.cancellationSummary;

  if (!cancellationSummary) {
    return recommendations;
  }

  const { highRiskCount = 0, mediumRiskCount = 0, windowDays = 30 } = cancellationSummary;

  // Rule R2: High Risk Cancellation Window Alert
  if (highRiskCount > 0) {
    const isHighPriority = highRiskCount >= config.highRiskCancellationCount;
    recommendations.push({
      ruleId: 'R2',
      category: RecommendationCategory.CANCELLATION,
      title: `High Cancellation Risk (${highRiskCount} bookings in next ${windowDays} days)`,
      reason: `${highRiskCount} upcoming booking(s) have a high cancellation probability (>= 70%).`,
      suggestedAction: `Review deposit requirements, send proactive confirmation check-ins, and prepare waitlist options.`,
      priority: isHighPriority ? RecommendationPriority.HIGH : RecommendationPriority.MEDIUM,
      confidence: 0.85,
      sourceData: {
        highRiskCount,
        windowDays,
      },
      dedupKey: `R2:window-${windowDays}d`,
    });
  }

  // Rule R3: Medium Risk Cancellation Monitoring
  if (mediumRiskCount > 0) {
    recommendations.push({
      ruleId: 'R3',
      category: RecommendationCategory.CANCELLATION,
      title: `Monitor Medium Cancellation Risk (${mediumRiskCount} bookings)`,
      reason: `${mediumRiskCount} upcoming booking(s) show moderate cancellation signals (40% - 69%).`,
      suggestedAction: `Engage guests with pre-arrival activity itineraries and dining reservation promotions to secure commitment.`,
      priority: RecommendationPriority.LOW,
      confidence: 0.75,
      sourceData: {
        mediumRiskCount,
        windowDays,
      },
      dedupKey: `R3:window-${windowDays}d`,
    });
  }

  return recommendations;
}

module.exports = evaluateCancellationRule;
