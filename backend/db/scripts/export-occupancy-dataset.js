/**
 * Rebuilds ml-service/data/processed/daily_occupancy_forecast_data.csv from
 * REAL historical booking data already sitting in the Postgres `bookings`
 * table (the original H1.csv "Resort Hotel" dataset, imported directly into
 * the DB rather than kept as a CSV — 10,000 bookings spanning 2015-06-30 to
 * 2016-04-11). The live 2026 demo bookings are deliberately excluded so the
 * time series stays continuous and isn't corrupted by a multi-year gap.
 *
 * Column shape matches exactly what
 * ml-service/app/features/feature_engineering.py::build_occupancy_features()
 * expects: ArrivalDate, TotalBookings, ConfirmedBookings, OccupancyRate,
 * AvgADR, AvgLeadTime — one row per CALENDAR day (gaps filled with zeros),
 * not just days that had a booking, so lag/rolling features are meaningful.
 *
 * OccupancyRate uses this resort's real physical capacity (220 rooms, see
 * db/migrations/001_initial_schema.sql seed) as the denominator — an
 * explicit, documented approximation, since the original H1.csv dataset's
 * true historical hotel capacity is unknown/undocumented.
 */
const fs = require('fs');
const path = require('path');
const { getPool } = require('../../src/config/database');
const logger = require('../../src/utils/logger');

const ASSUMED_CAPACITY = 220;
const OUTPUT_PATH = path.join(__dirname, '../../../ml-service/data/processed/daily_occupancy_forecast_data.csv');

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

async function exportOccupancyDataset() {
  const pool = getPool();
  logger.info('Exporting real historical booking data to daily_occupancy_forecast_data.csv...');

  try {
    const query = `
      SELECT
        arrival_date::date AS d,
        COUNT(*) AS total_bookings,
        COUNT(*) FILTER (WHERE status != 'CANCELLED') AS confirmed_bookings,
        COALESCE(AVG(adr), 0) AS avg_adr,
        COALESCE(AVG(GREATEST(0, arrival_date - booking_date)), 0) AS avg_lead_time
      FROM bookings
      WHERE arrival_date < '2017-01-01'
      GROUP BY d
      ORDER BY d;
    `;
    const res = await pool.query(query);

    if (res.rows.length === 0) {
      throw new Error('No historical (pre-2017) booking rows found — nothing to export.');
    }

    const byDate = new Map();
    for (const row of res.rows) {
      byDate.set(toDateStr(row.d), row);
    }

    const minDate = res.rows[0].d;
    const maxDate = res.rows[res.rows.length - 1].d;

    const lines = ['ArrivalDate,TotalBookings,ConfirmedBookings,OccupancyRate,AvgADR,AvgLeadTime'];
    let cursor = new Date(minDate);
    const end = new Date(maxDate);
    let filledDays = 0;
    let totalDays = 0;

    while (cursor <= end) {
      const dateStr = toDateStr(cursor);
      const row = byDate.get(dateStr);
      totalDays += 1;

      if (row) {
        const totalBookings = parseInt(row.total_bookings, 10);
        const confirmedBookings = parseInt(row.confirmed_bookings, 10);
        const occupancyRate = Math.min(100, Math.round((confirmedBookings / ASSUMED_CAPACITY) * 1000) / 10);
        const avgAdr = Math.round(parseFloat(row.avg_adr) * 100) / 100;
        const avgLeadTime = Math.round(parseFloat(row.avg_lead_time) * 100) / 100;
        lines.push(`${dateStr},${totalBookings},${confirmedBookings},${occupancyRate},${avgAdr},${avgLeadTime}`);
      } else {
        // Real gap in the historical data — a genuine zero-booking day, not fabricated.
        filledDays += 1;
        lines.push(`${dateStr},0,0,0,0,0`);
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, lines.join('\n') + '\n');

    logger.info(
      { totalDays, daysWithBookings: totalDays - filledDays, filledZeroDays: filledDays, outputPath: OUTPUT_PATH },
      'Occupancy dataset export complete.'
    );
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, 'Occupancy dataset export failed');
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  exportOccupancyDataset();
}

module.exports = exportOccupancyDataset;
