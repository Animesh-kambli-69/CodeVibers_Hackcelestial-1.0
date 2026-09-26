/**
 * Pure Deterministic Decision Engine.
 * Takes resort state and configuration, evaluates business rules,
 * prioritizes, deduplicates, and returns recommendation drafts.
 * Zero external I/O, database, or LLM dependencies.
 */
const RULE_CONFIG = require('./config/thresholds');
const validateState = require('./services/validateState');
const evaluateRules = require('./services/evaluateRules');
const prioritize = require('./services/prioritize');
const deduplicate = require('./services/deduplicate');
const { classifyRisk, demandLevel } = require('./classify');

function generateRecommendations(state, config = RULE_CONFIG) {
  const validation = validateState(state);
  if (!validation.valid) {
    throw new Error(`Invalid state passed to Decision Engine: ${validation.error}`);
  }

  // 1. Evaluate rules
  const drafts = evaluateRules(state, config);

  // 2. Deduplicate within run
  const deduped = deduplicate(drafts);

  // 3. Prioritize
  const prioritized = prioritize(deduped);

  return prioritized;
}

module.exports = {
  generateRecommendations,
  classifyRisk,
  demandLevel,
  RULE_CONFIG,
};
