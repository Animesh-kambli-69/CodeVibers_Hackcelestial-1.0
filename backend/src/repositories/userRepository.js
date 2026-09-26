/**
 * User Repository for Authentication and RBAC.
 */

class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findByEmail(email) {
    const query = `
      SELECT id, email, name, password_hash, role, is_active, created_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [email]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async findById(id) {
    const query = `
      SELECT id, email, name, role, is_active, created_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async create({ name = null, email, passwordHash, role }) {
    const query = `
      INSERT INTO users (name, email, password_hash, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, TRUE, NOW())
      RETURNING id, email, name, role, is_active, created_at;
    `;
    const res = await this.pool.query(query, [name, email, passwordHash, role]);
    return this._mapRow(res.rows[0]);
  }

  async listByRole(role, { search = null, limit = 50, offset = 0 } = {}) {
    const conditions = ['role = $1'];
    const params = [role];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const countRes = await this.pool.query(`SELECT COUNT(*) as total FROM users ${whereClause};`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const query = `
      SELECT id, email, name, role, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;
    const res = await this.pool.query(query, params);
    return { items: res.rows.map((row) => this._mapRow(row)), total };
  }

  async setActive(id, isActive) {
    const query = `
      UPDATE users
      SET is_active = $2
      WHERE id = $1
      RETURNING id, email, name, role, is_active, created_at;
    `;
    const res = await this.pool.query(query, [id, isActive]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  _mapRow(row) {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }
}

module.exports = UserRepository;
