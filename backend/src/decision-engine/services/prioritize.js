/**
 * Sorts and ranks generated recommendations by priority and confidence.
 */
const { RecommendationPriority } = require('../../models/enums');

const PRIORITY_ORDER = {
  [RecommendationPriority.CRITICAL]: 1,
  [RecommendationPriority.HIGH]: 2,
  [RecommendationPriority.MEDIUM]: 3,
  [RecommendationPriority.LOW]: 4,
};

function prioritize(drafts = []) {
  return [...drafts].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority] || 99;
    const pB = PRIORITY_ORDER[b.priority] || 99;
    if (pA !== pB) {
      return pA - pB;
    }
    return (b.confidence || 1) - (a.confidence || 1);
  });
}

module.exports = prioritize;
