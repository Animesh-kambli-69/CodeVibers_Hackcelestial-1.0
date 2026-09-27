/**
 * Social Signal Service Adapter.
 * The ONLY file in the backend that knows the social data source's URL shape and payload.
 *
 * Uses Reddit's public search JSON endpoint (no API key/auth required for read-only search)
 * to satisfy the mandatory "real-world social signal integration" requirement with genuine
 * public data rather than a mocked feed. Reddit rate-limits anonymous requests, so failures
 * are expected occasionally — callers must treat this as best-effort and degrade gracefully
 * (see digitalTwinService, which falls back to the cached social_signals table).
 *
 * Sentiment is a lightweight keyword heuristic, not a trained model — labeled as such
 * everywhere it is surfaced, in keeping with the "no hallucination" principle in
 * docs/decision-engine.md.
 */
const env = require('../config/env');
const { request } = require('../utils/http');
const { scoreSentiment } = require('../utils/sentiment');
const logger = require('../utils/logger');

const POSITIVE_WORDS = ['great', 'love', 'amazing', 'beautiful', 'perfect', 'enjoy', 'relax', 'sunny', 'clear', 'best'];
const NEGATIVE_WORDS = ['storm', 'flood', 'cancel', 'delay', 'stuck', 'ruined', 'warning', 'evacuate', 'damage', 'worst', 'closed', 'danger'];

function heuristicSentiment(text) {
  return scoreSentiment(text, { positiveWords: POSITIVE_WORDS, negativeWords: NEGATIVE_WORDS });
}

class SocialSignalService {
  constructor({
    baseUrl = env.SOCIAL_SIGNAL_API_BASE_URL,
    defaultQuery = env.SOCIAL_SIGNAL_QUERY,
    timeoutMs = 5000,
  } = {}) {
    this.baseUrl = baseUrl;
    this.defaultQuery = defaultQuery;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Fetches recent public posts matching a query and scores basic sentiment.
   * @param {string} query
   * @param {number} limit
   */
  async fetchSignals(query = this.defaultQuery, limit = 15) {
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&sort=new&limit=${limit}`;

    const res = await request(url, {
      method: 'GET',
      timeout: this.timeoutMs,
      headers: {
        // Reddit requires a descriptive UA on anonymous requests or it returns 429/403.
        'User-Agent': 'smart-resort-360-digital-twin/1.0 (hackathon research use)',
      },
    });

    if (!res.ok) {
      throw new Error(`Social signal source responded with status ${res.status}`);
    }

    const data = await res.json();
    const children = (data.data && data.data.children) || [];

    return children.map((c) => {
      const post = c.data;
      const text = `${post.title} ${post.selftext || ''}`;
      return {
        source: 'reddit',
        query,
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        author: post.author,
        externalCreatedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : null,
        sentiment: heuristicSentiment(text),
        weatherRelated: true,
        raw: { subreddit: post.subreddit, score: post.score, num_comments: post.num_comments },
      };
    });
  }

  async health() {
    try {
      await this.fetchSignals(this.defaultQuery, 1);
      return { ok: true };
    } catch (err) {
      logger.warn({ error: err.message }, 'Social signal service health check failed');
      return { ok: false };
    }
  }
}

module.exports = SocialSignalService;
module.exports.heuristicSentiment = heuristicSentiment;
