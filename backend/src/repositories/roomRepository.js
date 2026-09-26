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

  async listRooms() {
    const query = `
      SELECT id, room_number, room_type, max_occupancy, base_price, status
      FROM rooms
      ORDER BY room_number ASC;
    `;
    const res = await this.pool.query(query);
    return res.rows.map((row) => ({
      id: row.id,
      roomNumber: row.room_number,
      roomType: row.room_type,
      maxOccupancy: row.max_occupancy,
      basePrice: parseFloat(row.base_price),
      status: row.status,
    }));
  }
}

module.exports = RoomRepository;
