const express = require('express');
const { getTodayString, addDays } = require('../utils/dates');
const { getPool } = require('../config/database');

function createPublicRoutes() {
  const router = express.Router();

  router.post('/bookings', async (req, res) => {
    try {
      const pool = getPool();
      const { 
        guestName, 
        email, 
        phone, 
        roomType, 
        checkInDate, 
        checkOutDate, 
        adults, 
        depositType, 
        bookingChannel, 
        previousCancellations,
        specialRequests,
        totalCost,
        adr
      } = req.body;

      const today = getTodayString();
      const arrival = checkInDate || addDays(today, 7);
      const departure = checkOutDate || addDays(arrival, 3);
      const requestedRoomType = (roomType || 'DELUXE').toUpperCase();
      const guestEmail = email || (guestName ? guestName.toLowerCase().replace(/\s+/g, '.') + '@example.com' : 'guest@example.com');
      const guestPhone = phone || '+1 (555) 000-0000';
      const guestFullName = guestName || 'Valued Guest';

      // 1. IDENTITY RESOLUTION (Guest Matching / Creation in PostgreSQL)
      const existingGuest = await pool.query(
        `SELECT id, total_stays FROM guests WHERE email = $1 OR name ILIKE $2 LIMIT 1`,
        [guestEmail, guestFullName]
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
        if (parseInt(historyRes.rows[0].cancel_count) > 0) {
          actualPreviousCancellations = parseInt(historyRes.rows[0].cancel_count);
        }
      } else {
        const guestRes = await pool.query(
          `INSERT INTO guests (name, email, phone, loyalty_tier, total_stays, special_requirements)
           VALUES ($1, $2, $3, 'STANDARD', 1, $4) RETURNING id;`,
          [guestFullName, guestEmail, guestPhone, specialRequests || 'None']
        );
        guestId = guestRes.rows[0].id;
      }
      
      // 2. Room lookup for the requested Room Type
      let roomRes = await pool.query(
        `SELECT id, base_price, room_type FROM rooms WHERE room_type = $1 LIMIT 1`,
        [requestedRoomType]
      );

      if (roomRes.rows.length === 0) {
        roomRes = await pool.query(`SELECT id, base_price, room_type FROM rooms LIMIT 1`);
      }

      const roomId = roomRes.rows.length > 0 ? roomRes.rows[0].id : null;
      const nightlyRate = adr || (roomRes.rows.length > 0 ? parseFloat(roomRes.rows[0].base_price) : 250.00);

      // 3. Insert into PostgreSQL bookings table
      const insertRes = await pool.query(`
        INSERT INTO bookings (
          guest_id, room_id, booking_date, arrival_date, departure_date, status, adults, children,
          adr, deposit_type, booking_channel, customer_type, special_requests, previous_cancellations,
          previous_bookings, room_type, meal, country
        ) VALUES (
          $1, $2, $3, $4, $5, 'CONFIRMED', $6, 0,
          $7, $8, $9, 'Transient', $10, $11,
          0, $12, 'BB', 'USA'
        ) RETURNING id;
      `, [
        guestId,
        roomId,
        today,
        arrival,
        departure,
        parseInt(adults) || 2,
        nightlyRate,
        depositType || 'No Deposit',
        bookingChannel || 'Direct',
        specialRequests || 'None',
        actualPreviousCancellations,
        requestedRoomType
      ]);

      const bookingId = insertRes.rows[0].id;

      return res.status(201).json({
        success: true,
        bookingId,
        guestId,
        bookingRef: `CSR-${bookingId.slice(0, 8).toUpperCase()}`,
        message: 'Booking successfully stored in PostgreSQL'
      });
    } catch (err) {
      console.error('Failed to create public booking in PostgreSQL:', err);
      res.status(500).json({ error: 'Failed to create booking in database', details: err.message });
    }
  });

  return router;
}

module.exports = createPublicRoutes;
