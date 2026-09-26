/**
 * PostgreSQL connection pool configuration.
 * Automatically enables SSL for cloud providers like Neon and Supabase.
 */
const { Pool } = require('pg');
const env = require('./env');

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
  }
  return pool;
}

module.exports = {
  getPool,
};
