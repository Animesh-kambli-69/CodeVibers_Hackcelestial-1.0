const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { getPool } = require('../src/config/database');
const logger = require('../src/utils/logger');
const { addDays } = require('../src/utils/dates');

// Adjust this limit if you want to import ALL 80,000+ rows. 
// We default to 5000 to prevent overloading free tier databases during demo.
const IMPORT_LIMIT = 5000; 

async function importCsv() {
  const pool = getPool();
  logger.info('Starting CSV migration to PostgreSQL...');

  try {
    // 1. Get existing guests to attach bookings to
    const guestRes = await pool.query('SELECT id FROM guests LIMIT 2');
    if (guestRes.rows.length === 0) {
      throw new Error("No guests found. Please run 'npm run db:seed' first.");
    }
    const guestIds = guestRes.rows.map(r => r.id);

    // 2. Get existing rooms
    const roomRes = await pool.query("SELECT id, room_type FROM rooms");
    const rooms = {
      'STANDARD': roomRes.rows.filter(r => r.room_type === 'STANDARD').map(r => r.id),
      'DELUXE': roomRes.rows.filter(r => r.room_type === 'DELUXE').map(r => r.id),
      'SUITE': roomRes.rows.filter(r => r.room_type === 'SUITE').map(r => r.id),
    };

    const csvFilePath = path.join(__dirname, '../../ml-service/data/processed/hotel_bookings_cleaned.csv');
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found at ${csvFilePath}`);
    }

    const bookings = [];
    
    // Read the CSV file
    await new Promise((resolve, reject) => {
      let count = 0;
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          if (count < IMPORT_LIMIT) {
            bookings.push(row);
            count++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    logger.info(`Successfully parsed ${bookings.length} rows from CSV. Starting bulk insert...`);

    // Insert in batches of 500 to not overload the query string limits
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < bookings.length; i += batchSize) {
      const batch = bookings.slice(i, i + batchSize);
      
      const values = [];
      const queryPlaceholders = [];
      let paramIndex = 1;

      for (const row of batch) {
        const guestId = guestIds[i % guestIds.length];
        
        // Determine room type based on 'ReservedRoomType' from CSV (C, A, D, etc)
        let roomType = 'STANDARD';
        if (row.ReservedRoomType === 'C' || row.ReservedRoomType === 'E') roomType = 'SUITE';
        else if (row.ReservedRoomType === 'D' || row.ReservedRoomType === 'F') roomType = 'DELUXE';

        const roomIds = rooms[roomType] || rooms['STANDARD'];
        const roomId = roomIds[Math.floor(Math.random() * roomIds.length)];

        // Map CSV dates
        // Original CSV has dates from 2015-2017. We can optionally shift them to current year so they appear in dashboard.
        // For true natural data migration, we keep original dates:
        const arrivalDate = row.ArrivalDate; 
        
        // Calculate booking_date by subtracting LeadTime from ArrivalDate
        const arrivalDateObj = new Date(arrivalDate);
        const bookingDateObj = new Date(arrivalDateObj);
        bookingDateObj.setDate(bookingDateObj.getDate() - parseInt(row.LeadTime || 0));
        const bookingDate = bookingDateObj.toISOString().split('T')[0];

        // Calculate departure date
        const nights = parseInt(row.StaysInWeekendNights || 0) + parseInt(row.StaysInWeekNights || 0);
        const departureDateObj = new Date(arrivalDateObj);
        departureDateObj.setDate(departureDateObj.getDate() + Math.max(1, nights));
        const departureDate = departureDateObj.toISOString().split('T')[0];

        let status = 'CHECKED_OUT';
        if (row.IsCanceled === '1') status = 'CANCELLED';

        const adr = parseFloat(row.ADR || 0);
        
        const country = (row.Country || 'PRT').trim().substring(0, 3);
        const meal = (row.Meal || 'BB').trim();
        const reservedRoomType = (row.ReservedRoomType || 'A').trim().substring(0, 2);
        
        values.push(
          guestId, roomId, bookingDate, arrivalDate, departureDate, status,
          parseInt(row.Adults || 1), parseInt(row.Children || 0), parseInt(row.Babies || 0),
          adr, (row.DepositType || 'No Deposit').trim(), (row.MarketSegment || 'Direct').trim(),
          (row.CustomerType || 'Transient').trim(), parseInt(row.TotalOfSpecialRequests || 0),
          parseInt(row.PreviousCancellations || 0), parseInt(row.PreviousBookingsNotCanceled || 0),
          roomType, (row.DistributionChannel || 'Direct').trim(), meal,
          country, parseInt(row.BookingChanges || 0),
          parseInt(row.RequiredCarParkingSpaces || 0), reservedRoomType
        );

        const placeholders = [];
        for (let j = 0; j < 23; j++) {
          placeholders.push(`$${paramIndex++}`);
        }
        queryPlaceholders.push(`(${placeholders.join(', ')})`);
      }

      const query = `
        INSERT INTO bookings (
          guest_id, room_id, booking_date, arrival_date, departure_date, status,
          adults, children, babies, adr, deposit_type, booking_channel, customer_type,
          special_requests, previous_cancellations, previous_bookings, room_type,
          distribution_channel, meal, country, booking_changes, required_car_parking_spaces,
          reserved_room_type_code
        ) VALUES ${queryPlaceholders.join(', ')}
      `;

      await pool.query(query, values);
      inserted += batch.length;
      logger.info(`Inserted ${inserted}/${bookings.length} bookings...`);
    }

    logger.info('CSV Migration to PostgreSQL completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, 'Migration failed');
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  importCsv();
}

module.exports = importCsv;
