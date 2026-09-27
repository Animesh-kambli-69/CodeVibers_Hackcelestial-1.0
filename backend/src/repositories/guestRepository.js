/**
 * Guest Repository for Guest Profiles and Operations List.
 */

class GuestRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findById(guestId) {
    const query = `
      SELECT id, user_id, name, email, phone, loyalty_tier, total_stays, special_requirements, created_at
      FROM guests
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [guestId]);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      loyaltyTier: row.loyalty_tier,
      totalStays: row.total_stays,
      specialRequirements: row.special_requirements,
      createdAt: row.created_at,
    };
  }

  async findByUserId(userId) {
    const query = `
      SELECT id, user_id, name, email, phone, loyalty_tier, total_stays, special_requirements, created_at
      FROM guests
      WHERE user_id = $1
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [userId]);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      loyaltyTier: row.loyalty_tier,
      totalStays: row.total_stays,
      specialRequirements: row.special_requirements,
      createdAt: row.created_at,
    };
  }

  async listGuests({ search, loyaltyTier, limit = 20, offset = 0 } = {}) {
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    if (loyaltyTier) {
      params.push(loyaltyTier);
      conditions.push(`loyalty_tier = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM guests ${whereClause};`;
    const countRes = await this.pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0].total, 10);

    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const query = `
      SELECT id, user_id, name, email, phone, loyalty_tier, total_stays, special_requirements, created_at
      FROM guests
      ${whereClause}
      ORDER BY name ASC, id ASC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const res = await this.pool.query(query, params);
    const items = res.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      loyaltyTier: row.loyalty_tier,
      totalStays: row.total_stays,
      specialRequirements: row.special_requirements,
      createdAt: row.created_at,
    }));

    return { items, total };
  }

  /** Links a guest profile to a (newly created or existing) login account. */
  async linkUser(guestId, userId) {
    await this.pool.query('UPDATE guests SET user_id = $2 WHERE id = $1;', [guestId, userId]);
  }

  /** Detaches the guest's login account without touching the guest profile itself. */
  async unlinkUser(guestId) {
    await this.pool.query('UPDATE guests SET user_id = NULL WHERE id = $1;', [guestId]);
  }
}

module.exports = GuestRepository;
