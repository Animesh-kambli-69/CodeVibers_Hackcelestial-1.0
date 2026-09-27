const { getPool } = require('../src/config/database');

async function getChatConstraints() {
  const pool = getPool();
  const res = await pool.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'chat_messages'::regclass");
  console.log(`=== TABLE chat_messages CONSTRAINTS ===`);
  res.rows.forEach(r => console.log(r.conname, ':', r.def));
  process.exit(0);
}
getChatConstraints();
