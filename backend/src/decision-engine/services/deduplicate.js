/**
 * Deduplication service within a single Decision Engine evaluation run.
 */

function deduplicate(drafts = []) {
  const seenKeys = new Set();
  const result = [];

  const hasR9 = drafts.some((d) => d.ruleId === 'R9');

  for (const draft of drafts) {
    // If R9 peak-risk rule is triggered, skip R2 aggregate to avoid duplicate alert
    if (hasR9 && draft.ruleId === 'R2') {
      continue;
    }

    if (!seenKeys.has(draft.dedupKey)) {
      seenKeys.add(draft.dedupKey);
      result.push(draft);
    }
  }

  return result;
}

module.exports = deduplicate;
