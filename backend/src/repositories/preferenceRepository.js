/**
 * Preference Repository for Guest Personalization.
 */

class PreferenceRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findByGuestId(guestId) {
    const query = `
      SELECT id, guest_id, preference_type, preference_value, confidence, source, updated_at
      FROM guest_preferences
      WHERE guest_id = $1
      ORDER BY 
        CASE source
          WHEN 'EXPLICIT' THEN 1
          WHEN 'HISTORY' THEN 2
          WHEN 'PREDICTED' THEN 3
          ELSE 4
        END ASC,
        confidence DESC;
    `;
    const res = await this.pool.query(query, [guestId]);
    return res.rows.map((row) => ({
      id: row.id,
      guestId: row.guest_id,
      preferenceType: row.preference_type,
      preferenceValue: row.preference_value,
      confidence: parseFloat(row.confidence),
      source: row.source,
      updatedAt: row.updated_at,
    }));
  }

  async findTopNonRoomPreference(guestId) {
    const query = `
      SELECT id, guest_id, preference_type, preference_value, confidence, source, updated_at
      FROM guest_preferences
      WHERE guest_id = $1 AND preference_type != 'ROOM'
      ORDER BY 
        CASE source
          WHEN 'EXPLICIT' THEN 1
          WHEN 'HISTORY' THEN 2
          WHEN 'PREDICTED' THEN 3
          ELSE 4
        END ASC,
        confidence DESC
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [guestId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      guestId: row.guest_id,
      preferenceType: row.preference_type,
      preferenceValue: row.preference_value,
      confidence: parseFloat(row.confidence),
      source: row.source,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = PreferenceRepository;
