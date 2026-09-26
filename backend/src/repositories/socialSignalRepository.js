/**
 * Social Signal Repository — persists fetched public social posts and serves
 * as the cache fallback when the live social source is unreachable/rate-limited.
 */

class SocialSignalRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async saveBatch(signals = []) {
    const results = [];
    for (const s of signals) {
      results.push(await this.save(s));
    }
    return results;
  }

  async save({
    source = 'reddit',
    query,
    title,
    url = null,
    author = null,
    externalCreatedAt = null,
    sentiment = 'NEUTRAL',
    weatherRelated = true,
    raw = null,
  }) {
    const q = `
      INSERT INTO social_signals (
        source, query, title, url, author, external_created_at, sentiment, weather_related, raw, captured_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
      RETURNING *;
    `;
    const res = await this.pool.query(q, [
      source,
      query,
      title,
      url,
      author,
      externalCreatedAt,
      sentiment,
      weatherRelated,
      raw ? JSON.stringify(raw) : null,
    ]);
    return this._mapRow(res.rows[0]);
  }

  async findRecent(limit = 15) {
    const query = `
      SELECT * FROM social_signals
      ORDER BY captured_at DESC
      LIMIT $1;
    `;
    const res = await this.pool.query(query, [limit]);
    return res.rows.map((r) => this._mapRow(r));
  }

  _mapRow(row) {
    return {
      id: row.id,
      source: row.source,
      query: row.query,
      title: row.title,
      url: row.url,
      author: row.author,
      externalCreatedAt: row.external_created_at,
      sentiment: row.sentiment,
      weatherRelated: row.weather_related,
      raw: typeof row.raw === 'string' ? JSON.parse(row.raw) : row.raw,
      capturedAt: row.captured_at,
    };
  }
}

module.exports = SocialSignalRepository;
