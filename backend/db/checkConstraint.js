const { getPool } = require('../src/config/database');

async function getConstraints() {
  const pool = getPool();
  const res = await pool.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'recommendations'::regclass");
  console.log('CONSTRAINTS:', res.rows);
  process.exit(0);
}
getConstraints();
