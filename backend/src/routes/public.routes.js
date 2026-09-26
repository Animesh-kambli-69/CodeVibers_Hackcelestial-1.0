const express = require('express');
const { getTodayString, addDays } = require('../utils/dates');
const { getPool } = require('../config/database');

function createPublicRoutes() {
  const router = express.Router();

  router.post('/bookings', async (req, res) => {
    try {
      const pool = getPool();
      const { leadTimeDays, depositType, bookingChannel, previousCancellations, guestName } = req.body;
      const today = getTodayString();
      const arrival = addDays(today, parseInt(leadTimeDays) || 30);
      const departure = addDays(arrival, 3);
      
      // IDENTITY RESOLUTION (Guest Matching)
      // Check if a guest with this name or email already exists to prevent them from wiping their history!
      const generatedEmail = guestName ? guestName.toLowerCase().replace(/\s+/g, '.') + '@example.com' : 'john.doe@example.com';
      
      const existingGuest = await pool.query(
        `SELECT id FROM guests WHERE email = $1 OR name ILIKE $2 LIMIT 1`,
        [generatedEmail, guestName || 'John Doe']
      );

      let guestId;
      let actualPreviousCancellations = parseInt(previousCancellations) || 0;

      if (existingGuest.rows.length > 0) {
        guestId = existingGuest.rows[0].id;
        
        // Find their TRUE cancellation count from the database
        const historyRes = await pool.query(
          `SELECT COUNT(*) as cancel_count FROM bookings WHERE guest_id = $1 AND status = 'CANCELED'`,
          [guestId]
        );
        // If they have real cancellations, we OVERRIDE their input to prevent fraud
        if (parseInt(historyRes.rows[0].cancel_count) > 0) {
          actualPreviousCancellations = parseInt(historyRes.rows[0].cancel_count);
        }
      } else {
        const guestRes = await pool.query(
          `INSERT INTO guests (name, email, phone, loyalty_tier, total_stays, special_requirements)
           VALUES ($1, $2, '+91 99999 99999', 'NONE', 0, 'None') RETURNING id;`,
          [guestName || 'John Doe', generatedEmail]
        );
        guestId = guestRes.rows[0].id;
      }
      
      const roomRes = await pool.query(`SELECT id FROM rooms WHERE room_type = 'DELUXE' LIMIT 1`);
      const roomId = roomRes.rows[0].id;

      const insertRes = await pool.query(`
        INSERT INTO bookings (
          guest_id, room_id, booking_date, arrival_date, departure_date, status, adults, children,
          adr, deposit_type, booking_channel, customer_type, special_requests, previous_cancellations,
          previous_bookings, room_type, meal, country
        ) VALUES (
          $1, $2, $3, $4, $5, 'CONFIRMED', 2, 0, 7500.00, $6, $7, 'Transient', 0, $8, 0, 'DELUXE', 'BB', 'IND'
        ) RETURNING id;
      `, [guestId, roomId, today, arrival, departure, depositType || 'No Deposit', bookingChannel || 'Online TA', actualPreviousCancellations]);

      return res.json({ success: true, bookingId: insertRes.rows[0].id });
    } catch (err) {
      console.error('Failed to create public booking:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = createPublicRoutes;
