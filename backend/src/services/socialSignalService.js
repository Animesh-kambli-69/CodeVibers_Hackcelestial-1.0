/**
 * Social Signal Service Adapter.
 * The ONLY file in the backend that knows the social data source's URL shape and payload.
 *
 * Uses Hacker News Algolia API (https://hn.algolia.com/api) — free, no API key required,
 * no IP-based blocking (unlike Reddit which returns 403 from server environments like Render).
 * Failures degrade gracefully to the cached social_signals table in Postgres
 * (see digitalTwinService).
 *
 * Sentiment is a lightweight keyword heuristic, not a trained model — labeled as such
 * everywhere it is surfaced, in keeping with the "no hallucination" principle in
 * docs/decision-engine.md.
 */
const env = require('../config/env');
const { request } = require('../utils/http');
const logger = require('../utils/logger');

const POSITIVE_WORDS = ['great', 'love', 'amazing', 'beautiful', 'perfect', 'enjoy', 'relax', 'sunny', 'clear', 'best'];
const NEGATIVE_WORDS = ['storm', 'flood', 'cancel', 'delay', 'stuck', 'ruined', 'warning', 'evacuate', 'damage', 'worst', 'closed', 'danger'];

function heuristicSentiment(text) {
  const lower = (text || '').toLowerCase();
  let score = 0;
  for (const w of POSITIVE_WORDS) if (lower.includes(w)) score += 1;
  for (const w of NEGATIVE_WORDS) if (lower.includes(w)) score -= 1;
  if (score > 0) return 'POSITIVE';
  if (score < 0) return 'NEGATIVE';
  return 'NEUTRAL';
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
   * Uses Hacker News Algolia API — free, no API key, works from all server IPs.
   * @param {string} query
   * @param {number} limit
   */
  async fetchSignals(query = this.defaultQuery, limit = 15) {
    // Hacker News Algolia API: fully public, no auth, no IP-based blocking on Render/Railway/etc.
    const hnUrl = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&hitsPerPage=${limit}&tags=story`;

    const res = await request(hnUrl, {
      method: 'GET',
      timeout: this.timeoutMs,
      headers: {
        'User-Agent': 'smart-resort-360-digital-twin/1.0',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Social signal source responded with status ${res.status}`);
    }

    const data = await res.json();
    const hits = data.hits || [];

    return hits.map((hit) => {
      const text = `${hit.title || ''} ${hit.story_text || hit.comment_text || ''}`;
      return {
        source: 'hackernews',
        query,
        title: hit.title || hit.story_title || '(untitled)',
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author,
        externalCreatedAt: hit.created_at || null,
        sentiment: heuristicSentiment(text),
        weatherRelated: true,
        raw: { points: hit.points, num_comments: hit.num_comments, objectID: hit.objectID },
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
