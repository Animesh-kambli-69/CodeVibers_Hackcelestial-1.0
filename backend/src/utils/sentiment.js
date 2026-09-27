/**
 * Shared keyword-heuristic sentiment scoring.
 * Not a trained model — labeled as such everywhere it's surfaced, per the
 * "no hallucination" principle in docs/decision-engine.md. Used by both
 * socialSignalService.js (weather/travel chatter) and feedbackService.js
 * (guest stay reviews) via the same scoring primitive, with domain-specific
 * word lists for each.
 */

function scoreSentiment(text, { positiveWords = [], negativeWords = [] } = {}) {
  const lower = (text || '').toLowerCase();
  let score = 0;
  for (const w of positiveWords) if (lower.includes(w)) score += 1;
  for (const w of negativeWords) if (lower.includes(w)) score -= 1;
  if (score > 0) return 'POSITIVE';
  if (score < 0) return 'NEGATIVE';
  return 'NEUTRAL';
}

// Guest stay feedback vocabulary — deliberately includes the exact topics
// decision-engine.md §6-§7 example rules reference (AC, WiFi, cleanliness,
// food) so real feedback can actually drive those rules.
const GUEST_FEEDBACK_POSITIVE_WORDS = [
  'great', 'love', 'amazing', 'wonderful', 'excellent', 'perfect', 'clean',
  'friendly', 'comfortable', 'relaxing', 'delicious', 'beautiful', 'helpful',
  'spacious', 'quiet', 'best', 'enjoyed', 'fantastic',
];
const GUEST_FEEDBACK_NEGATIVE_WORDS = [
  'ac', 'air conditioning', 'wifi', 'wi-fi', 'noisy', 'noise', 'dirty', 'rude',
  'slow', 'broken', 'smell', 'cold', 'hot', 'cockroach', 'bug', 'mosquito',
  'worst', 'terrible', 'awful', 'disappointed', 'overpriced', 'delay', 'delayed',
  'uncomfortable', 'leak', 'stain', 'mold',
];

const FEEDBACK_TOPICS = ['AC', 'WiFi', 'Cleanliness', 'Food', 'Staff', 'Noise', 'Pricing'];
const TOPIC_KEYWORDS = {
  AC: ['ac', 'air conditioning', 'air conditioner', 'cooling'],
  WiFi: ['wifi', 'wi-fi', 'internet', 'connection'],
  Cleanliness: ['clean', 'dirty', 'dust', 'stain', 'smell', 'mold'],
  Food: ['food', 'breakfast', 'dinner', 'lunch', 'restaurant', 'meal', 'delicious'],
  Staff: ['staff', 'rude', 'friendly', 'helpful', 'service'],
  Noise: ['noisy', 'noise', 'loud', 'quiet'],
  Pricing: ['expensive', 'overpriced', 'price', 'cost', 'value'],
};

function scoreGuestFeedback(text) {
  return scoreSentiment(text, {
    positiveWords: GUEST_FEEDBACK_POSITIVE_WORDS,
    negativeWords: GUEST_FEEDBACK_NEGATIVE_WORDS,
  });
}

/** Returns the subset of FEEDBACK_TOPICS mentioned in the given text. */
function extractTopics(text) {
  const lower = (text || '').toLowerCase();
  return FEEDBACK_TOPICS.filter((topic) => TOPIC_KEYWORDS[topic].some((kw) => lower.includes(kw)));
}

module.exports = {
  scoreSentiment,
  scoreGuestFeedback,
  extractTopics,
  FEEDBACK_TOPICS,
};
