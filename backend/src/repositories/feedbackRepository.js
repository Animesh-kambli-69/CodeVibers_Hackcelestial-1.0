/**
 * Guest Feedback Repository.
 */
const crypto = require('crypto');

class FeedbackRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async createPending({ bookingId, guestId, graceDeadline }) {
    const token = crypto.randomBytes(24).toString('hex');
    const query = `
      INSERT INTO guest_feedback (booking_id, guest_id, status, feedback_token, grace_deadline, created_at)
      VALUES ($1, $2, 'PENDING', $3, $4, NOW())
      ON CONFLICT (booking_id) DO NOTHING
      RETURNING *;
    `;
    const res = await this.pool.query(query, [bookingId, guestId, token, graceDeadline]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async findByBookingId(bookingId) {
    const res = await this.pool.query('SELECT * FROM guest_feedback WHERE booking_id = $1;', [bookingId]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async findByToken(token) {
    const res = await this.pool.query('SELECT * FROM guest_feedback WHERE feedback_token = $1;', [token]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async listPendingForGuest(guestId) {
    const res = await this.pool.query(
      `SELECT * FROM guest_feedback WHERE guest_id = $1 AND status = 'PENDING' ORDER BY created_at DESC;`,
      [guestId]
    );
    return res.rows.map((r) => this._mapRow(r));
  }

  async submit(feedbackId, { rating, comment, sentiment, topics }) {
    const query = `
      UPDATE guest_feedback
      SET status = 'SUBMITTED', rating = $2, comment = $3, sentiment = $4, topics = $5, submitted_at = NOW()
      WHERE id = $1 AND status = 'PENDING'
      RETURNING *;
    `;
    const res = await this.pool.query(query, [feedbackId, rating, comment, sentiment, topics]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  /** Guest ids whose PENDING feedback deadline has passed — candidates for account destruction. */
  async findExpiredPendingGuestIds() {
    const res = await this.pool.query(
      `SELECT DISTINCT guest_id FROM guest_feedback WHERE status = 'PENDING' AND grace_deadline < NOW();`
    );
    return res.rows.map((r) => r.guest_id);
  }

  async hasExpiredPending(guestId) {
    const res = await this.pool.query(
      `SELECT 1 FROM guest_feedback WHERE guest_id = $1 AND status = 'PENDING' AND grace_deadline < NOW() LIMIT 1;`,
      [guestId]
    );
    return res.rows.length > 0;
  }

  async listSubmittedSince(sinceDate) {
    const res = await this.pool.query(
      `SELECT * FROM guest_feedback WHERE status = 'SUBMITTED' AND submitted_at >= $1 ORDER BY submitted_at DESC;`,
      [sinceDate]
    );
    return res.rows.map((r) => this._mapRow(r));
  }

  _mapRow(row) {
    return {
      id: row.id,
      bookingId: row.booking_id,
      guestId: row.guest_id,
      rating: row.rating,
      comment: row.comment,
      sentiment: row.sentiment,
      topics: row.topics || [],
      status: row.status,
      feedbackToken: row.feedback_token,
      graceDeadline: row.grace_deadline,
      createdAt: row.created_at,
      submittedAt: row.submitted_at,
    };
  }
}

module.exports = FeedbackRepository;
