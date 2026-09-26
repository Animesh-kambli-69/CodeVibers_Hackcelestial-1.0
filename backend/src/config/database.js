/**
 * PostgreSQL connection pool configuration.
 * Automatically enables SSL for cloud providers like Neon and Supabase.
 */
const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

let pool = null;

function getPool() {
  if (!pool) {
    const isLocalhost =
      env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');

    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Idle pooled clients can be dropped by the server (e.g. Neon closes idle
    // connections aggressively). Without this handler, pg emits an 'error'
    // event on the pool with no listener, which Node treats as an unhandled
    // error and crashes the whole process.
    pool.on('error', (err) => {
      logger.error({ err: err.message }, 'Unexpected error on idle PostgreSQL client');
    });
  }
  return pool;
}

module.exports = {
  getPool,
};
