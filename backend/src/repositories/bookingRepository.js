/**
 * Booking Repository for Manager Analytics, Forecasts, and Guest Stay History.
 * Mostly read-only per Principle P8 — checkIn/checkOut/cancel below are the
 * deliberate, narrowly-scoped exception (status + timestamps only, never
 * dates/room/price), added for the check-in/check-out lifecycle. Each write
 * method includes its expected current status in the WHERE clause so an
 * invalid transition affects zero rows instead of silently overwriting state;
 * bookingLifecycleService.js interprets a zero-row result as a conflict.
 */

class BookingRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findById(bookingId) {
    const query = `
      SELECT b.*, r.room_number
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = $1
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [bookingId]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async listGuestBookings(guestId, { limit = 20, offset = 0 } = {}) {
    const countQuery = `SELECT COUNT(*) as total FROM bookings WHERE guest_id = $1;`;
    const countRes = await this.pool.query(countQuery, [guestId]);
    const total = parseInt(countRes.rows[0].total, 10);

    const query = `
      SELECT b.*, r.room_number
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.guest_id = $1
      ORDER BY b.arrival_date DESC, b.id ASC
      LIMIT $2 OFFSET $3;
    `;
    const res = await this.pool.query(query, [guestId, limit, offset]);
    const items = res.rows.map((row) => this._mapRow(row));

    return { items, total };
  }

  async findCurrentStay(guestId, todayStr) {
    const query = `
      SELECT b.*, r.room_number
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.guest_id = $1
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND b.arrival_date <= $2
        AND b.departure_date > $2
      ORDER BY b.arrival_date DESC
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [guestId, todayStr]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  /** Most recent CHECKED_IN booking for a guest — used to attach a room to a service request. */
  async findActiveCheckedInStay(guestId) {
    const query = `
      SELECT b.*, r.room_number
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.guest_id = $1 AND b.status = 'CHECKED_IN'
      ORDER BY b.checked_in_at DESC NULLS LAST
      LIMIT 1;
    `;
    const res = await this.pool.query(query, [guestId]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async countCurrentlyOccupiedRooms(todayStr) {
    const query = `
      SELECT COUNT(DISTINCT b.id) as occupied_count
      FROM bookings b
      WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND b.arrival_date <= $1
        AND b.departure_date > $1;
    `;
    const res = await this.pool.query(query, [todayStr]);
    return parseInt(res.rows[0].occupied_count, 10);
  }

  async getConfirmedArrivalsCount(dateStr) {
    const query = `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE status IN ('CONFIRMED', 'CHECKED_IN')
        AND arrival_date = $1;
    `;
    const res = await this.pool.query(query, [dateStr]);
    return parseInt(res.rows[0].count, 10);
  }

  async getUpcomingArrivalsCount(startDateStr, endDateStr) {
    const query = `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE status = 'CONFIRMED'
        AND arrival_date >= $1
        AND arrival_date < $2;
    `;
    const res = await this.pool.query(query, [startDateStr, endDateStr]);
    return parseInt(res.rows[0].count, 10);
  }

  async getSpecialRequirementsCountToday(todayStr) {
    const query = `
      SELECT COUNT(DISTINCT b.id) as count
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      WHERE b.arrival_date = $1
        AND (b.special_requests > 0 OR (g.special_requirements IS NOT NULL AND g.special_requirements != ''));
    `;
    const res = await this.pool.query(query, [todayStr]);
    return parseInt(res.rows[0].count, 10);
  }

  async getHistoricalDailyArrivals(startDateStr, endDateStr) {
    const query = `
      SELECT arrival_date::text as date, COUNT(*) as actual_bookings
      FROM bookings
      WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        AND arrival_date >= $1
        AND arrival_date < $2
      GROUP BY arrival_date
      ORDER BY arrival_date ASC;
    `;
    const res = await this.pool.query(query, [startDateStr, endDateStr]);
    return res.rows.map((row) => ({
      date: row.date,
      actualBookings: parseInt(row.actual_bookings, 10),
    }));
  }

  async getBookingsForScoring(startDateStr, endDateStr) {
    const query = `
      SELECT b.*, g.name as guest_name, g.email as guest_email
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      WHERE b.status = 'CONFIRMED'
        AND b.arrival_date >= $1
        AND b.arrival_date < $2
      ORDER BY b.arrival_date ASC, b.id ASC;
    `;
    const res = await this.pool.query(query, [startDateStr, endDateStr]);
    return res.rows.map((row) => this._mapRow(row));
  }

  async getRoomDemandCounts(startDateStr, endDateStr) {
    const query = `
      SELECT room_type, COUNT(*) as booked_count
      FROM bookings
      WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        AND arrival_date >= $1
        AND arrival_date < $2
      GROUP BY room_type;
    `;
    const res = await this.pool.query(query, [startDateStr, endDateStr]);
    const counts = { STANDARD: 0, DELUXE: 0, SUITE: 0 };
    res.rows.forEach((row) => {
      counts[row.room_type] = parseInt(row.booked_count, 10);
    });
    return counts;
  }

  /**
   * CONFIRMED -> CHECKED_IN. Returns null (not throws) if the booking wasn't
   * found or wasn't CONFIRMED, so the caller can distinguish "not found" from
   * "invalid transition" by re-reading the row.
   */
  async checkIn(bookingId, { earlyCheckin = false } = {}) {
    const query = `
      UPDATE bookings
      SET status = 'CHECKED_IN', checked_in_at = NOW(), early_checkin = $2
      WHERE id = $1 AND status = 'CONFIRMED'
      RETURNING *;
    `;
    const res = await this.pool.query(query, [bookingId, earlyCheckin]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  /** CHECKED_IN -> CHECKED_OUT. */
  async checkOut(bookingId, { lateCheckout = false } = {}) {
    const query = `
      UPDATE bookings
      SET status = 'CHECKED_OUT', checked_out_at = NOW(), late_checkout = $2
      WHERE id = $1 AND status = 'CHECKED_IN'
      RETURNING *;
    `;
    const res = await this.pool.query(query, [bookingId, lateCheckout]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  /** CONFIRMED -> CANCELLED. Deliberately excludes CHECKED_IN — cancelling after
   * check-in is blocked by this WHERE clause, not just by the service layer. */
  async cancel(bookingId) {
    const query = `
      UPDATE bookings
      SET status = 'CANCELLED'
      WHERE id = $1 AND status = 'CONFIRMED'
      RETURNING *;
    `;
    const res = await this.pool.query(query, [bookingId]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  _mapRow(row) {
    return {
      id: row.id,
      guestId: row.guest_id,
      roomId: row.room_id,
      roomNumber: row.room_number || null,
      bookingDate: row.booking_date instanceof Date ? row.booking_date.toISOString().split('T')[0] : row.booking_date,
      arrivalDate: row.arrival_date instanceof Date ? row.arrival_date.toISOString().split('T')[0] : row.arrival_date,
      departureDate: row.departure_date instanceof Date ? row.departure_date.toISOString().split('T')[0] : row.departure_date,
      status: row.status,
      adults: row.adults,
      children: row.children,
      babies: row.babies,
      adr: parseFloat(row.adr),
      depositType: row.deposit_type,
      bookingChannel: row.booking_channel,
      customerType: row.customer_type,
      specialRequests: row.special_requests,
      previousCancellations: row.previous_cancellations,
      previousBookings: row.previous_bookings,
      roomType: row.room_type,
      distributionChannel: row.distribution_channel,
      meal: row.meal,
      country: row.country,
      bookingChanges: row.booking_changes,
      requiredCarParkingSpaces: row.required_car_parking_spaces,
      reservedRoomTypeCode: row.reserved_room_type_code,
      guestName: row.guest_name,
      guestEmail: row.guest_email,
      checkedInAt: row.checked_in_at,
      checkedOutAt: row.checked_out_at,
      earlyCheckin: row.early_checkin,
      lateCheckout: row.late_checkout,
      createdAt: row.created_at,
    };
  }
}

module.exports = BookingRepository;
