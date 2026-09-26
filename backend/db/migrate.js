const fs = require('fs');
const path = require('path');
const { getPool } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrate() {
  const pool = getPool();
  const migrationsDir = path.join(__dirname, 'migrations');

  logger.info('Starting database migration...');

  try {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      logger.info(`Executing migration: ${file}`);
      await pool.query(sql);
      logger.info(`Successfully applied migration: ${file}`);
    }

    logger.info('All database migrations completed successfully.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, 'Database migration failed');
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
