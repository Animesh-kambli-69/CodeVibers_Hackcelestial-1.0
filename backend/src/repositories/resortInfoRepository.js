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
      return [];
    }

    // Full-Text Search with ILIKE fallback ranking
    const query = `
      SELECT id, category, title, content, updated_at,
             ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as rank
      FROM resort_information
      WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
         OR title ILIKE '%' || $1 || '%'
         OR content ILIKE '%' || $1 || '%'
      ORDER BY rank DESC, title ASC
      LIMIT $2;
    `;

    try {
      const res = await this.pool.query(query, [queryText, limit]);
      return res.rows.map((row) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        content: row.content,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      // Fallback to simple ILIKE search if plainto_tsquery fails on special syntax
      const fallbackQuery = `
        SELECT id, category, title, content, updated_at
        FROM resort_information
        WHERE title ILIKE '%' || $1 || '%' OR content ILIKE '%' || $1 || '%'
        LIMIT $2;
      `;
      const res = await this.pool.query(fallbackQuery, [queryText, limit]);
      return res.rows.map((row) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        content: row.content,
        updatedAt: row.updated_at,
      }));
    }
  }
}

module.exports = ResortInfoRepository;
