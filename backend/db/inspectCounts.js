const { getPool } = require('../src/config/database');

async function inspectTables() {
  const pool = getPool();
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  console.log('=== TABLE ROW COUNTS IN POSTGRESQL ===');
  for (const row of tables.rows) {
    const t = row.table_name;
    const cnt = await pool.query(`SELECT count(*) FROM "${t}"`);
    console.log(`${t.padEnd(30)}: ${cnt.rows[0].count} rows`);
  }
  process.exit(0);
}

inspectTables().catch(err => {
  console.error(err);
  process.exit(1);
});
