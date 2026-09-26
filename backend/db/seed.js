/**
 * Smart Resort 360 Database Seed Script.
 * Populates realistic resort data matching PRD §63 demo scenario.
 */
const { getPool } = require('../src/config/database');
const { hashPassword } = require('../src/utils/password');
const { getTodayString, addDays } = require('../src/utils/dates');
const logger = require('../src/utils/logger');

async function seed() {
  const pool = getPool();
  logger.info('Starting database seeding...');

  try {
    const today = getTodayString();

    // 1. Clean existing tables in reverse dependency order
    await pool.query(`
      TRUNCATE chat_messages, chat_conversations, predictions, recommendations,
               resort_information, guest_activities, guest_preferences, bookings,
               rooms, guests, users CASCADE;
    `);

    // 2. Seed Users
    const managerPassword = await hashPassword('Manager@123');
    const opsPassword = await hashPassword('Ops@123');
    const guestPassword = await hashPassword('Guest@123');

    const managerRes = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'RESORT_MANAGER') RETURNING id;`,
      ['manager@smartresort360.com', managerPassword]
    );
    const opsRes = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'OPERATIONS_MANAGER') RETURNING id;`,
      ['ops@smartresort360.com', opsPassword]
    );
    const rahulUserRes = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'GUEST') RETURNING id;`,
      ['rahul.sharma@example.com', guestPassword]
    );
    const priyaUserRes = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'GUEST') RETURNING id;`,
      ['priya.patel@example.com', guestPassword]
    );

    const rahulUserId = rahulUserRes.rows[0].id;
    const priyaUserId = priyaUserRes.rows[0].id;

    // 3. Seed Guests
    const rahulGuestRes = await pool.query(
      `INSERT INTO guests (user_id, name, email, phone, loyalty_tier, total_stays, special_requirements)
       VALUES ($1, 'Rahul Sharma', 'rahul.sharma@example.com', '+91 98765 43210', 'SILVER', 3, 'Quiet room away from elevator, vegetarian dining options')
       RETURNING id;`,
      [rahulUserId]
    );
    const priyaGuestRes = await pool.query(
      `INSERT INTO guests (user_id, name, email, phone, loyalty_tier, total_stays, special_requirements)
       VALUES ($1, 'Priya Patel', 'priya.patel@example.com', '+91 98123 45678', 'GOLD', 5, 'High floor, late check-out requested')
       RETURNING id;`,
      [priyaUserId]
    );

    const rahulGuestId = rahulGuestRes.rows[0].id;
    const priyaGuestId = priyaGuestRes.rows[0].id;

    // 4. Seed Rooms (220 rooms: 100 Standard, 80 Deluxe, 40 Suite)
    logger.info('Seeding 220 physical resort rooms...');
    const roomIdsByType = { STANDARD: [], DELUXE: [], SUITE: [] };

    // Standard Rooms 101 - 200
    for (let i = 1; i <= 100; i++) {
      const roomNum = `STD-${100 + i}`;
      const res = await pool.query(
        `INSERT INTO rooms (room_number, room_type, max_occupancy, base_price, status) VALUES ($1, 'STANDARD', 2, 4500.00, 'AVAILABLE') RETURNING id;`,
        [roomNum]
      );
      roomIdsByType.STANDARD.push(res.rows[0].id);
    }

    // Deluxe Rooms 201 - 280
    for (let i = 1; i <= 80; i++) {
      const roomNum = `DLX-${200 + i}`;
      const res = await pool.query(
        `INSERT INTO rooms (room_number, room_type, max_occupancy, base_price, status) VALUES ($1, 'DELUXE', 3, 7500.00, 'AVAILABLE') RETURNING id;`,
        [roomNum]
      );
      roomIdsByType.DELUXE.push(res.rows[0].id);
    }

    // Suite Rooms 301 - 340
    for (let i = 1; i <= 40; i++) {
      const roomNum = `SUT-${300 + i}`;
      const res = await pool.query(
        `INSERT INTO rooms (room_number, room_type, max_occupancy, base_price, status) VALUES ($1, 'SUITE', 4, 14000.00, 'AVAILABLE') RETURNING id;`,
        [roomNum]
      );
      roomIdsByType.SUITE.push(res.rows[0].id);
    }

    // 5. Seed Guest Preferences
    await pool.query(`
      INSERT INTO guest_preferences (guest_id, preference_type, preference_value, confidence, source) VALUES
      ('${rahulGuestId}', 'ROOM', 'DELUXE', 0.95, 'EXPLICIT'),
      ('${rahulGuestId}', 'FOOD', 'Vegetarian', 0.90, 'HISTORY'),
      ('${rahulGuestId}', 'ACTIVITY', 'Spa', 0.85, 'HISTORY'),
      ('${priyaGuestId}', 'ROOM', 'SUITE', 0.90, 'EXPLICIT'),
      ('${priyaGuestId}', 'ACTIVITY', 'Yoga Session', 0.88, 'HISTORY');
    `);

    // 6. Seed Guest Activities
    await pool.query(`
      INSERT INTO guest_activities (guest_id, activity_type, activity_name, activity_date) VALUES
      ('${rahulGuestId}', 'SPA', 'Ayurvedic Massage Therapy', '${addDays(today, -15)}'),
      ('${rahulGuestId}', 'WELLNESS', 'Morning Yoga and Meditation', '${addDays(today, -14)}'),
      ('${rahulGuestId}', 'DINING', 'Lakeside Candlelight Dinner', '${addDays(today, -13)}'),
      ('${priyaGuestId}', 'SPA', 'Signature Aromatherapy', '${addDays(today, -5)}');
    `);

    // 7. Seed Resort Information Knowledge Base (AI Concierge Grounding)
    await pool.query(`
      INSERT INTO resort_information (category, title, content) VALUES
      ('DINING', 'The Spice Pavilion Restaurant Timings & Menu', 'Open daily for Breakfast (7:00 AM - 10:30 AM), Lunch (12:30 PM - 3:30 PM), and Dinner (7:00 PM - 11:00 PM). Featuring authentic regional cuisine and an extensive organic vegetarian menu with dietary customization upon request.'),
      ('SPA', 'Ananda Wellness & Spa Centre', 'Open daily from 8:00 AM to 9:00 PM. Offers Ayurvedic massages, hot stone therapy, aromatherapy, and private jacuzzi suites. Advance reservation is recommended by calling extension 402.'),
      ('ACTIVITIES', 'Resort Recreation & Water Sports', 'Activities include guided nature walks (7:00 AM daily), infinity pool access (6:00 AM - 10:00 PM), tennis court rentals, and sunset boat cruises departing at 5:30 PM from the private marina.'),
      ('FACILITIES', 'Fitness Centre & Infinity Swimming Pool', 'The fitness centre is equipped with cardio machines, free weights, and personal trainers, open 24 hours. The temperature-controlled infinity pool is open from 6:00 AM till 10:00 PM with towel and mocktail service.'),
      ('POLICIES', 'Check-In, Check-Out, and Cancellation Policies', 'Standard Check-In time is 2:00 PM and Check-Out time is 11:00 AM. Early check-in and late check-out are subject to availability. Free cancellation is permitted up to 48 hours before the arrival date.'),
      ('TRANSPORTATION', 'Airport Shuttle & Private Chauffeur', 'Complimentary luxury airport shuttle runs every two hours between 6:00 AM and 10:00 PM. Private limousine transfers can be booked through the concierge desk with 12 hours advance notice.');
    `);

    // 8. Seed Bookings
    // Rahul's Current In-House Stay
    await pool.query(`
      INSERT INTO bookings (
        guest_id, room_id, booking_date, arrival_date, departure_date, status, adults, children,
        adr, deposit_type, booking_channel, customer_type, special_requests, previous_cancellations,
        previous_bookings, room_type, meal, country
      ) VALUES (
        '${rahulGuestId}', '${roomIdsByType.DELUXE[0]}', '${addDays(today, -10)}', '${addDays(today, -1)}', '${addDays(today, 3)}',
        'CHECKED_IN', 2, 0, 7500.00, 'No Deposit', 'Direct', 'Transient', 2, 0, 2, 'DELUXE', 'BB', 'IND'
      );
    `);

    // Priya's Upcoming Booking
    await pool.query(`
      INSERT INTO bookings (
        guest_id, room_id, booking_date, arrival_date, departure_date, status, adults, children,
        adr, deposit_type, booking_channel, customer_type, special_requests, previous_cancellations,
        previous_bookings, room_type, meal, country
      ) VALUES (
        '${priyaGuestId}', '${roomIdsByType.SUITE[0]}', '${addDays(today, -5)}', '${addDays(today, 2)}', '${addDays(today, 6)}',
        'CONFIRMED', 2, 1, 14000.00, 'No Deposit', 'Online TA', 'Transient', 1, 0, 4, 'SUITE', 'HB', 'IND'
      );
    `);

    // Seed additional synthetic bookings for occupancy and cancellation risk simulation
    for (let i = 1; i <= 35; i++) {
      const roomType = i % 3 === 0 ? 'SUITE' : i % 2 === 0 ? 'DELUXE' : 'STANDARD';
      const roomId = roomIdsByType[roomType][i % roomIdsByType[roomType].length];
      const isHighRisk = i % 4 === 0;
      const leadTime = isHighRisk ? 65 : 15;

      await pool.query(`
        INSERT INTO bookings (
          guest_id, room_id, booking_date, arrival_date, departure_date, status, adults, children,
          adr, deposit_type, booking_channel, customer_type, special_requests, previous_cancellations,
          previous_bookings, room_type, meal, country
        ) VALUES (
          '${i % 2 === 0 ? rahulGuestId : priyaGuestId}', '${roomId}', '${addDays(today, -leadTime)}', '${addDays(today, i % 10)}', '${addDays(today, (i % 10) + 3)}',
          'CONFIRMED', 2, 0, 6000.00, '${isHighRisk ? 'No Deposit' : 'Non Refund'}', '${isHighRisk ? 'Online TA' : 'Direct'}', 'Transient',
          ${isHighRisk ? 0 : 1}, ${isHighRisk ? 2 : 0}, ${isHighRisk ? 0 : 3}, '${roomType}', 'BB', 'IND'
        );
      `);
    }

    logger.info('Database seeding finished successfully.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, 'Database seeding failed');
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
