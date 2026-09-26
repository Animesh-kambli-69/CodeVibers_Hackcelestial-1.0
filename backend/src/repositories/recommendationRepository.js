/**
 * Recommendation Repository for Decision Engine recommendations.
 * Enforces deduplication via dedup_key and tracks recommendation status lifecycle.
 */

class RecommendationRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findById(id) {
    const query = `
      SELECT id, category, title, reason, suggested_action, priority, confidence, source_data, status, note, dedup_key, created_at, updated_at
      FROM recommendations
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async listRecommendations({ status, category, priority, limit = 20, offset = 0 } = {}) {
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (priority) {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM recommendations ${whereClause};`;
    const countRes = await this.pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0].total, 10);

    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const query = `
      SELECT id, category, title, reason, suggested_action, priority, confidence, source_data, status, note, dedup_key, created_at, updated_at
      FROM recommendations
      ${whereClause}
      ORDER BY 
        CASE priority
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
          ELSE 5
        END ASC,
        created_at DESC, id ASC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const res = await this.pool.query(query, params);
    const items = res.rows.map((row) => this._mapRow(row));

    return { items, total };
  }

  async getLatestRecommendationCreatedAt() {
    const res = await this.pool.query('SELECT MAX(created_at) as latest_created_at FROM recommendations;');
    return res.rows[0].latest_created_at ? new Date(res.rows[0].latest_created_at) : null;
  }

  async insertDrafts(drafts) {
    if (!drafts || drafts.length === 0) return 0;

    let insertedCount = 0;
    for (const draft of drafts) {
      const query = `
        INSERT INTO recommendations (
          category, title, reason, suggested_action, priority, confidence, source_data, status, dedup_key, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
        ON CONFLICT (dedup_key) DO NOTHING
        RETURNING id;
      `;

      const res = await this.pool.query(query, [
        draft.category,
        draft.title,
        draft.reason,
        draft.suggestedAction,
        draft.priority,
        draft.confidence !== undefined ? draft.confidence : 1.0,
        JSON.stringify(draft.sourceData || {}),
        'NEW',
        draft.dedupKey,
      ]);

      if (res.rows.length > 0) {
        insertedCount++;
      }
    }

    return insertedCount;
  }

  async updateStatus(id, newStatus, note = null) {
    const query = `
      UPDATE recommendations
      SET status = $1,
          note = COALESCE($2, note),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;
    const res = await this.pool.query(query, [newStatus, note, id]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  _mapRow(row) {
    return {
      id: row.id,
      category: row.category,
      title: row.title,
      reason: row.reason,
      suggestedAction: row.suggested_action,
      priority: row.priority,
      confidence: parseFloat(row.confidence),
      sourceData: typeof row.source_data === 'string' ? JSON.parse(row.source_data) : row.source_data,
      status: row.status,
      note: row.note,
      dedupKey: row.dedup_key,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = RecommendationRepository;
