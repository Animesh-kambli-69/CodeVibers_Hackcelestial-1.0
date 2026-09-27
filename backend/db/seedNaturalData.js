/**
 * High-Performance Natural Data Seeder for Smart Resort 360 & ML Predictions
 * Uses multi-row bulk SQL inserts for instant execution.
 */
const { getPool } = require('../src/config/database');
const { hashPassword } = require('../src/utils/password');
const { getTodayString, addDays } = require('../src/utils/dates');
const MlService = require('../src/services/mlService');
const logger = require('../src/utils/logger');

const GUEST_PROFILES = [
  { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', phone: '+91 98201 11223', tier: 'PLATINUM', stays: 8, req: 'Ocean view villa, early check-in, sparkling water', country: 'IND', type: 'Direct' },
  { name: 'Ananya Deshmukh', email: 'ananya.deshmukh@example.com', phone: '+91 98450 33445', tier: 'GOLD', stays: 4, req: 'High floor, vegetarian breakfast, spa appointment', country: 'IND', type: 'Direct' },
  { name: 'David Smith', email: 'david.smith@uktravel.co.uk', phone: '+44 7700 900123', tier: 'SILVER', stays: 2, req: 'Airport shuttle pickup at terminal 2, non-smoking', country: 'GBR', type: 'Online TA' },
  { name: 'Sophie Taylor', email: 'sophie.taylor@traveler.com', phone: '+44 7890 123456', tier: 'STANDARD', stays: 1, req: 'Late arrival after 10 PM, extra pillows', country: 'GBR', type: 'Online TA' },
  { name: 'Vikram & Sunita Singh', email: 'vikram.singh@familytravel.in', phone: '+91 97112 55667', tier: 'GOLD', stays: 5, req: 'Family interconnected suite, baby crib, pool access', country: 'IND', type: 'Direct' },
  { name: 'Elena Rostova', email: 'elena.rostova@globalcorp.de', phone: '+49 151 2345678', tier: 'SILVER', stays: 3, req: 'Quiet workspace with high-speed WiFi, ironing board', country: 'DEU', type: 'Corporate' },
  { name: 'Carlos Santos', email: 'carlos.santos@lisboa.pt', phone: '+351 912 345 678', tier: 'STANDARD', stays: 1, req: 'Standard check-in, rental car parking needed', country: 'PRT', type: 'Online TA' },
  { name: 'Rohan Gupta', email: 'rohan.gupta@fintech.in', phone: '+91 98330 77889', tier: 'PLATINUM', stays: 12, req: 'Presidential suite, private cabana reservation, champagne setup', country: 'IND', type: 'Direct' },
  { name: 'Kavita Iyer', email: 'kavita.iyer@consulting.in', phone: '+91 98210 99001', tier: 'GOLD', stays: 6, req: 'All-inclusive dining, yoga mat in room, ayurvedic wellness package', country: 'IND', type: 'Direct' },
  { name: 'Michael Chang', email: 'm.chang@singaporetech.sg', phone: '+65 9123 4567', tier: 'SILVER', stays: 2, req: 'Twin beds, late check-out at 3 PM', country: 'SGP', type: 'Online TA' }
];

async function seedNaturalData() {
  const pool = getPool();
  const ml = new MlService();
  const today = getTodayString();
  logger.info(`Starting Natural Data Seeding anchored around date: ${today}`);

  try {
    // 1. Clean existing tables
    await pool.query(`
      TRUNCATE chat_messages, chat_conversations, predictions, recommendations,
               resort_information, guest_activities, guest_preferences, bookings,
               rooms, guests, users CASCADE;
    `);

    // 2. Seed Users
    const staffPassword = await hashPassword('Password123!');
    const guestPassword = await hashPassword('Guest123!');

    await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES
       ('manager@smartresort.com', $1, 'RESORT_MANAGER'),
       ('ops@smartresort.com', $1, 'OPERATIONS_MANAGER');`,
      [staffPassword]
    );

    const guestIdMap = [];
    for (const g of GUEST_PROFILES) {
      const uRes = await pool.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'GUEST') RETURNING id;`,
        [g.email, guestPassword]
      );
      const gRes = await pool.query(
        `INSERT INTO guests (user_id, name, email, phone, loyalty_tier, total_stays, special_requirements)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
        [uRes.rows[0].id, g.name, g.email, g.phone, g.tier, g.stays, g.req]
      );
      guestIdMap.push({ guestId: gRes.rows[0].id, profile: g });
    }
    logger.info(`Seeded staff users and ${guestIdMap.length} guest profiles.`);

    // 3. Seed Rooms in Bulk (220 Rooms)
    const roomValues = [];
    for (let i = 1; i <= 100; i++) {
      roomValues.push(`('STD-${100 + i}', 'STANDARD', 2, 5000.00, 'AVAILABLE')`);
    }
    for (let i = 1; i <= 80; i++) {
      roomValues.push(`('DLX-${200 + i}', 'DELUXE', 3, 8500.00, 'AVAILABLE')`);
    }
    for (let i = 1; i <= 40; i++) {
      roomValues.push(`('SUT-${300 + i}', 'SUITE', 4, 16000.00, 'AVAILABLE')`);
    }

    const roomsRes = await pool.query(`
      INSERT INTO rooms (room_number, room_type, max_occupancy, base_price, status)
      VALUES ${roomValues.join(', ')}
      RETURNING id, room_type;
    `);

    const roomMap = { STANDARD: [], DELUXE: [], SUITE: [] };
    roomsRes.rows.forEach(r => roomMap[r.room_type].push(r.id));
    logger.info(`Bulk seeded ${roomsRes.rows.length} inventory rooms.`);

    // 4. Seed Grounding Knowledge Base
    await pool.query(`
      INSERT INTO resort_information (category, title, content) VALUES
      ('DINING', 'The Spice Pavilion & Sunset Grill', 'Open for Breakfast (7:00 AM - 10:30 AM), Lunch (12:30 PM - 3:30 PM), and Beachside Dinner (7:00 PM - 11:00 PM). Authentic regional seafood, wood-fired pizzas, vegan and Jain dining menus available.'),
      ('SPA', 'Ananda Ayurvedic Wellness & Hydrotherapy', 'Open daily 8:00 AM to 9:00 PM. Offers traditional Abhyanga oil massage, detox herbal wraps, heated private Jacuzzis, and ocean-facing couple treatment suites.'),
      ('ACTIVITIES', 'Water Sports & Sunset Catamaran Cruises', 'Private speedboats, jet skiing, stand-up paddleboarding (8:00 AM - 5:30 PM). Complimentary sunset dolphin cruise departs daily at 5:30 PM from the private marina.'),
      ('FACILITIES', 'Infinity Pool, Kids Club & 24/7 Gym', 'Heated oceanfront infinity pool operates 6:00 AM to 10:00 PM. Supervised Kids Club open 9:00 AM to 6:00 PM.'),
      ('TRANSPORTATION', 'Airport Limousine & Shuttle Schedule', 'Complimentary luxury AC coach runs every 2 hours between 6:00 AM and 10:00 PM to Goa International Airport. Private limousine transfers available.'),
      ('POLICIES', 'Check-In, Check-Out & Cancellation Terms', 'Check-in is at 2:00 PM, Check-out is at 11:00 AM. Free cancellation up to 48 hours prior to arrival. Complimentary high-speed WiFi throughout.');
    `);

    // 5. Seed Guest Preferences & Activities
    const prefValues = [];
    const actValues = [];
    for (const g of guestIdMap) {
      const roomType = g.profile.tier === 'PLATINUM' ? 'SUITE' : g.profile.tier === 'GOLD' ? 'DELUXE' : 'STANDARD';
      const food = g.profile.req.includes('vegetarian') ? 'Vegetarian' : 'Buffet & A la Carte';
      prefValues.push(`('${g.guestId}', 'ROOM', '${roomType}', 0.92, 'EXPLICIT')`);
      prefValues.push(`('${g.guestId}', 'FOOD', '${food}', 0.88, 'HISTORY')`);
      actValues.push(`('${g.guestId}', 'SPA', 'Signature Aromatherapy', '${addDays(today, -5)}')`);
      actValues.push(`('${g.guestId}', 'DINING', 'Sunset Seafood Dinner', '${addDays(today, -3)}')`);
    }
    await pool.query(`INSERT INTO guest_preferences (guest_id, preference_type, preference_value, confidence, source) VALUES ${prefValues.join(', ')};`);
    await pool.query(`INSERT INTO guest_activities (guest_id, activity_type, activity_name, activity_date) VALUES ${actValues.join(', ')};`);

    // 6. Generate Natural Bookings
    const bookingRows = [];

    // Horizon A: Current In-House Guests (Checked-in) - 16 bookings
    for (let i = 0; i < 16; i++) {
      const g = guestIdMap[i % guestIdMap.length];
      const roomType = i % 3 === 0 ? 'SUITE' : i % 2 === 0 ? 'DELUXE' : 'STANDARD';
      const roomId = roomMap[roomType][i];
      const adr = roomType === 'SUITE' ? 16000 : roomType === 'DELUXE' ? 8500 : 5000;
      bookingRows.push(`('${g.guestId}', '${roomId}', '${addDays(today, -15)}', '${addDays(today, -2)}', '${addDays(today, 3)}', 'CHECKED_IN', 2, ${i % 4 === 0 ? 1 : 0}, ${adr}, 'No Deposit', '${g.profile.type}', 'Transient', ${i % 2}, 0, ${g.profile.stays}, '${roomType}', 'BB', '${g.profile.country}')`);
    }

    // Horizon B: Arrivals Scheduled for Today - 10 bookings
    for (let i = 0; i < 10; i++) {
      const g = guestIdMap[i % guestIdMap.length];
      const roomType = i % 2 === 0 ? 'DELUXE' : 'STANDARD';
      const roomId = roomMap[roomType][i + 20];
      const adr = roomType === 'DELUXE' ? 8500 : 5000;
      bookingRows.push(`('${g.guestId}', '${roomId}', '${addDays(today, -20)}', '${today}', '${addDays(today, 4)}', 'CONFIRMED', 2, 0, ${adr}, 'No Deposit', '${g.profile.type}', 'Transient', 1, 0, ${g.profile.stays}, '${roomType}', 'BB', '${g.profile.country}')`);
    }

    // Horizon C: Next 30 Days Future Bookings - 75 bookings
    for (let i = 1; i <= 75; i++) {
      const g = guestIdMap[i % guestIdMap.length];
      const roomType = i % 4 === 0 ? 'SUITE' : i % 2 === 0 ? 'DELUXE' : 'STANDARD';
      const roomId = roomMap[roomType][(i + 30) % roomMap[roomType].length];
      const arrivalOffset = Math.floor((i / 75) * 28) + 1;
      
      const isHighRisk = i % 5 === 0;
      const isMediumRisk = i % 3 === 0 && !isHighRisk;
      const leadTime = isHighRisk ? 140 : isMediumRisk ? 45 : 12;
      const depositType = isHighRisk ? 'Non Refund' : 'No Deposit';
      const channel = isHighRisk ? 'Online TA' : isMediumRisk ? 'Offline TA/TO' : 'Direct';
      const prevCancel = isHighRisk ? 2 : 0;
      const specialReqs = isHighRisk ? 0 : isMediumRisk ? 1 : 3;
      const adr = roomType === 'SUITE' ? 16000 : roomType === 'DELUXE' ? 8500 : 5000;

      bookingRows.push(`('${g.guestId}', '${roomId}', '${addDays(today, -leadTime)}', '${addDays(today, arrivalOffset)}', '${addDays(today, arrivalOffset + 3)}', 'CONFIRMED', 2, ${i % 6 === 0 ? 2 : 0}, ${adr}, '${depositType}', '${channel}', 'Transient', ${specialReqs}, ${prevCancel}, ${isHighRisk ? 0 : g.profile.stays}, '${roomType}', '${i % 3 === 0 ? 'HB' : 'BB'}', '${g.profile.country}')`);
    }

    const insertedBookings = await pool.query(`
      INSERT INTO bookings (
        guest_id, room_id, booking_date, arrival_date, departure_date, status, adults, children,
        adr, deposit_type, booking_channel, customer_type, special_requests, previous_cancellations,
        previous_bookings, room_type, meal, country
      ) VALUES ${bookingRows.join(', ')}
      RETURNING id, arrival_date, booking_date, adr, adults, children, room_type, booking_channel, country;
    `);

    logger.info(`Bulk inserted ${insertedBookings.rows.length} natural bookings across all operational horizons.`);

    // 7. Score a representative batch of bookings with ML Service
    logger.info('Calling ML Service for live predictions...');
    let scoredCount = 0;
    const predInserts = [];

    for (const b of insertedBookings.rows.slice(0, 25)) {
      try {
        const cancelPred = await ml.scoreCancellation({
          adr: b.adr,
          arrivalDate: b.arrival_date,
          bookingDate: b.booking_date,
          adults: b.adults,
          children: b.children,
          weekendNights: 1,
          weekNights: 2,
          bookingChannel: b.booking_channel,
          country: b.country
        });

        if (cancelPred && cancelPred.probability !== undefined) {
          const predVal = cancelPred.probability;
          const riskLvl = cancelPred.risk_level || (predVal >= 0.7 ? 'HIGH' : predVal >= 0.4 ? 'MEDIUM' : 'LOW');
          const payloadJson = JSON.stringify(cancelPred).replace(/'/g, "''");
          const dateStr = new Date(b.arrival_date).toISOString().split('T')[0];
          predInserts.push(`('CANCELLATION', '${b.id}', ${predVal}, '${riskLvl}', '1.0.0', '${payloadJson}', '${dateStr}')`);
          scoredCount++;
        }
      } catch (err) {
        // Fallback for single item
      }
    }

    if (predInserts.length > 0) {
      await pool.query(`
        INSERT INTO predictions (prediction_type, entity_id, prediction_value, risk_level, model_version, payload, predicted_for)
        VALUES ${predInserts.join(', ')};
      `);
      logger.info(`Successfully stored ${scoredCount} live ML predictions in PostgreSQL database.`);
    }

    logger.info('Natural database seeding & ML prediction initialization completed successfully.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, 'Natural data seeding failed');
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  seedNaturalData();
}

module.exports = seedNaturalData;
