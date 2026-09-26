/**
 * User Repository for Authentication and RBAC.
 */

class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, role, created_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [email]);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at,
    };
  }

  async findById(id) {
    const query = `
      SELECT id, email, role, created_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    };
  }
}

module.exports = UserRepository;
