/**
 * Room Repository for Room Demands, Capacity, and Status.
 */

class RoomRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async countTotalRooms() {
    const res = await this.pool.query('SELECT COUNT(*) as total FROM rooms;');
    return parseInt(res.rows[0].total, 10);
  }

  async getRoomCountsByType() {
    const query = `
      SELECT room_type, COUNT(*) as total_count
      FROM rooms
      GROUP BY room_type;
    `;
    const res = await this.pool.query(query);
    const counts = { STANDARD: 0, DELUXE: 0, SUITE: 0 };
    res.rows.forEach((row) => {
      counts[row.room_type] = parseInt(row.total_count, 10);
    });
    return counts;
  }

  async getAverageBasePriceByType() {
    const query = `
      SELECT room_type, AVG(base_price) as avg_price
      FROM rooms
      GROUP BY room_type;
    `;
    const res = await this.pool.query(query);
    const prices = { STANDARD: 0, DELUXE: 0, SUITE: 0 };
    res.rows.forEach((row) => {
      prices[row.room_type] = parseFloat(row.avg_price);
    });
    return prices;
  }

  async listRooms() {
    const query = `
      SELECT id, room_number, room_type, max_occupancy, base_price, status
      FROM rooms
      ORDER BY room_number ASC;
    `;
    const res = await this.pool.query(query);
    return res.rows.map((row) => this._mapRow(row));
  }

  async findById(roomId) {
    const query = `
      SELECT id, room_number, room_type, max_occupancy, base_price, status
      FROM rooms
      WHERE id = $1;
    `;
    const res = await this.pool.query(query, [roomId]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  /**
   * Transitions a room's status and writes an audit row to room_status_log in
   * the same transaction — the room lifecycle (AVAILABLE -> OCCUPIED ->
   * MAINTENANCE -> AVAILABLE) is reconstructable and attributable, not just a
   * bare status flag. Row-locks the room for the duration to avoid two
   * concurrent transitions racing (e.g. check-in and maintenance-complete
   * firing on the same room at once).
   */
  async transitionStatus(roomId, toStatus, { reason = null, bookingId = null, changedBy = null } = {}) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const roomRes = await client.query('SELECT status FROM rooms WHERE id = $1 FOR UPDATE;', [roomId]);
      if (roomRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      const fromStatus = roomRes.rows[0].status;

      const updateRes = await client.query(
        'UPDATE rooms SET status = $1 WHERE id = $2 RETURNING id, room_number, room_type, max_occupancy, base_price, status;',
        [toStatus, roomId]
      );

      await client.query(
        `INSERT INTO room_status_log (room_id, booking_id, from_status, to_status, reason, changed_by, changed_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW());`,
        [roomId, bookingId, fromStatus, toStatus, reason, changedBy]
      );

      await client.query('COMMIT');
      return this._mapRow(updateRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  _mapRow(row) {
    return {
      id: row.id,
      roomNumber: row.room_number,
      roomType: row.room_type,
      maxOccupancy: row.max_occupancy,
      basePrice: parseFloat(row.base_price),
      status: row.status,
    };
  }
}

module.exports = RoomRepository;
