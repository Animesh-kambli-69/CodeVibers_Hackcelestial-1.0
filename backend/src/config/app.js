/**
 * Application operational constants and tunables.
 */
const appConfig = Object.freeze({
  BODY_LIMIT: '16kb',
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  ML: {
    TIMEOUT_MS: 5000,
    HEALTH_TIMEOUT_MS: 2000,
    CANCELLATION_CONCURRENCY: 8,
  },
  LLM: {
    TIMEOUT_MS: 15000,
    ENABLE_REPHRASING: false,
  },
  CONCIERGE: {
    TOP_K_SOURCES: 5,
    MAX_SEARCH_LENGTH: 100,
    MAX_MESSAGE_LENGTH: 1000,
    MAX_NOTE_LENGTH: 500,
    FALLBACK_MESSAGE: "I apologize, but I don't have enough verified information to answer that question accurately. Please contact the front desk for immediate assistance.",
  },
  RATE_LIMITS: {
    LOGIN: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX: 10,
    },
    CHAT: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX: 20,
    },
  },
});

module.exports = appConfig;
