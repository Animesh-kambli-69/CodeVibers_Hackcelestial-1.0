/**
 * Guest Service Request Repository.
 */
class ServiceRequestRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ guestId, roomId, type, description }) {
    const query = `
      INSERT INTO service_requests (guest_id, room_id, type, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await this.pool.query(query, [guestId, roomId, type, description]);
    return this._mapRow(res.rows[0]);
  }

  async findById(id) {
    const res = await this.pool.query('SELECT * FROM service_requests WHERE id = $1;', [id]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async listByGuestId(guestId) {
    const res = await this.pool.query(
      'SELECT * FROM service_requests WHERE guest_id = $1 ORDER BY created_at DESC;',
      [guestId]
    );
    return res.rows.map((r) => this._mapRow(r));
  }

  async listAll({ status } = {}) {
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE sr.status = $1';
    }
    const query = `
      SELECT sr.*, g.name AS guest_name, r.room_number
      FROM service_requests sr
      JOIN guests g ON g.id = sr.guest_id
      LEFT JOIN rooms r ON r.id = sr.room_id
      ${where}
      ORDER BY sr.created_at DESC;
    `;
    const res = await this.pool.query(query, params);
    return res.rows.map((r) => this._mapRowWithJoins(r));
  }

  async updateStatus(id, status) {
    const query = `
      UPDATE service_requests
      SET status = $2::VARCHAR,
          updated_at = NOW(),
          resolved_at = CASE WHEN $2::VARCHAR = 'COMPLETED' THEN NOW() ELSE resolved_at END
      WHERE id = $1
      RETURNING *;
    `;
    const res = await this.pool.query(query, [id, status]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  _mapRow(row) {
    return {
      id: row.id,
      guestId: row.guest_id,
      roomId: row.room_id,
      type: row.type,
      description: row.description,
      status: row.status,
      assignedStaffId: row.assigned_staff_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at,
    };
  }

  _mapRowWithJoins(row) {
    return {
      ...this._mapRow(row),
      guestName: row.guest_name,
      roomNumber: row.room_number,
    };
  }
}

module.exports = ServiceRequestRepository;
