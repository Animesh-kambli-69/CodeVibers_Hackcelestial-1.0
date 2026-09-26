/**
 * Evaluates all active business rules against the current resort state.
 */
const evaluateOccupancyRule = require('../rules/occupancyRule');
const evaluateCancellationRule = require('../rules/cancellationRule');
const evaluateRoomDemandRule = require('../rules/roomDemandRule');
const evaluateCombinedRule = require('../rules/combinedRule');

function evaluateRules(state, config) {
  const drafts = [];

  drafts.push(...evaluateOccupancyRule(state, config));
  drafts.push(...evaluateCancellationRule(state, config));
  drafts.push(...evaluateRoomDemandRule(state, config));
  drafts.push(...evaluateCombinedRule(state, config));

  return drafts;
}

module.exports = evaluateRules;
