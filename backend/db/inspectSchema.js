const { getPool } = require('../src/config/database');

async function inspectSchema() {
  const pool = getPool();
  const tables = ['recommendations', 'service_requests', 'social_signals', 'guest_feedback', 'chat_messages', 'digital_twin_scenarios', 'resort_information'];
  for (const t of tables) {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [t]);
    console.log('TABLE:', t);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }
  process.exit(0);
}

inspectSchema().catch(err => {
  console.error(err);
  process.exit(1);
});
