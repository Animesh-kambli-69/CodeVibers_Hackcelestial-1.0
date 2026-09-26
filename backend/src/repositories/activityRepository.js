/**
 * Guest Activity Repository for Guest Intelligence and History.
 */

class ActivityRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async listByGuestId(guestId) {
    const query = `
      SELECT id, guest_id, activity_type, activity_name, activity_date
      FROM guest_activities
      WHERE guest_id = $1
      ORDER BY activity_date DESC;
    `;
    const res = await this.pool.query(query, [guestId]);
    return res.rows.map((row) => ({
      id: row.id,
      guestId: row.guest_id,
      activityType: row.activity_type,
      activityName: row.activity_name,
      activityDate: row.activity_date instanceof Date ? row.activity_date.toISOString().split('T')[0] : row.activity_date,
    }));
  }
}

module.exports = ActivityRepository;
