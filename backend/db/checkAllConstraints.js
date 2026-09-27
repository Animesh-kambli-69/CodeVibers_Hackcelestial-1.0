const { getPool } = require('../src/config/database');

async function getAllConstraints() {
  const pool = getPool();
  const tables = ['service_requests', 'social_signals', 'guest_feedback', 'resort_information'];
  for (const t of tables) {
    const res = await pool.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = $1::regclass", [t]);
    console.log(`=== TABLE ${t} CONSTRAINTS ===`);
    res.rows.filter(r => r.def.includes('CHECK')).forEach(r => console.log(r.conname, ':', r.def));
  }
  process.exit(0);
}
getAllConstraints();
