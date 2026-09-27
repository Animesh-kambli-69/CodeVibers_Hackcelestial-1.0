/**
 * Resort Information Repository for Guest Knowledge Base & Grounded AI Concierge Retrieval.
 */

class ResortInfoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async list({ category, search, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM resort_information ${whereClause};`;
    const countRes = await this.pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0].total, 10);

    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const query = `
      SELECT id, category, title, content, updated_at
      FROM resort_information
      ${whereClause}
      ORDER BY category ASC, title ASC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const res = await this.pool.query(query, params);
    const items = res.rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      content: row.content,
      updatedAt: row.updated_at,
    }));

    return { items, total };
  }

  async searchGroundedSources(queryText, limit = 5) {
    if (!queryText || queryText.trim() === '') {
      const fallback = await this.pool.query('SELECT id, category, title, content, updated_at FROM resort_information ORDER BY category ASC LIMIT $1', [limit]);
      return fallback.rows.map(r => ({ id: r.id, category: r.category, title: r.title, content: r.content, updatedAt: r.updated_at }));
    }

    const stopWords = new Set([
      'what', 'are', 'is', 'the', 'a', 'an', 'and', 'or', 'to', 'for', 'in', 'on', 'at',
      'can', 'i', 'you', 'me', 'my', 'we', 'our', 'do', 'have', 'there', 'any', 'tell',
      'about', 'options', 'option', 'places', 'place', 'info', 'information', 'how', 'show'
    ]);

    const tokens = queryText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const categoryMap = {
      DINING: ['dining', 'restaurant', 'food', 'breakfast', 'lunch', 'dinner', 'tapas', 'bistro', 'cafe', 'eat', 'meal', 'drinks', 'bar', 'michelin', 'tuna'],
      SPA: ['spa', 'massage', 'wellness', 'ayurvedic', 'hydrotherapy', 'steam', 'facial', 'relax', 'plunge', 'treatment'],
      ACTIVITIES: ['activities', 'activity', 'snorkel', 'snorkeling', 'cruise', 'sailing', 'catamaran', 'dolphin', 'excursion', 'boat', 'marine', 'yoga'],
      FACILITIES: ['pool', 'infinity', 'gym', 'fitness', 'workout', 'technogym', 'deck', 'beach', 'swimming'],
      POLICIES: ['checkin', 'checkout', 'policy', 'policies', 'rules', 'arrival', 'departure', 'early', 'late', 'hours', 'time'],
      TRANSPORTATION: ['airport', 'transfer', 'limousine', 'taxi', 'helipad', 'car', 'pickup', 'drop', 'flight']
    };

    const matchedCategories = [];
    for (const [cat, words] of Object.entries(categoryMap)) {
      if (tokens.some((t) => words.some((w) => w.includes(t) || t.includes(w)))) {
        matchedCategories.push(cat);
      }
    }

    const conditions = [];
    const params = [];

    for (const t of tokens) {
      params.push(`%${t}%`);
      conditions.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length} OR category ILIKE $${params.length})`);
    }

    if (matchedCategories.length > 0) {
      params.push(matchedCategories);
      conditions.push(`category = ANY($${params.length})`);
    }

    try {
      let res;
      if (conditions.length > 0) {
        params.push(limit);
        const sql = `
          SELECT id, category, title, content, updated_at
          FROM resort_information
          WHERE ${conditions.join(' OR ')}
          ORDER BY (
            CASE 
              WHEN title ILIKE '%' || $1 || '%' THEN 1
              WHEN category = ANY($${matchedCategories.length > 0 ? params.length - 1 : 1}) THEN 2
              ELSE 3
            END
          ) ASC, title ASC
          LIMIT $${params.length};
        `;
        res = await this.pool.query(sql, params);
      }

      if (!res || res.rows.length === 0) {
        // Fallback to top resort articles so LLM is always grounded
        const fallbackRes = await this.pool.query(
          'SELECT id, category, title, content, updated_at FROM resort_information ORDER BY category ASC LIMIT $1',
          [limit]
        );
        return fallbackRes.rows.map((r) => ({
          id: r.id,
          category: r.category,
          title: r.title,
          content: r.content,
          updatedAt: r.updated_at,
        }));
      }

      return res.rows.map((row) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        content: row.content,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      const fallbackRes = await this.pool.query(
        'SELECT id, category, title, content, updated_at FROM resort_information ORDER BY category ASC LIMIT $1',
        [limit]
      );
      return fallbackRes.rows.map((r) => ({
        id: r.id,
        category: r.category,
        title: r.title,
        content: r.content,
        updatedAt: r.updated_at,
      }));
    }
  }
}

module.exports = ResortInfoRepository;
