const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Default config for local postgres if DATABASE_URL is not provided
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/resort_db',
});

// Initialize DB schema
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        phone VARCHAR(255) UNIQUE,
        password TEXT,
        role VARCHAR(50) CHECK(role IN ('manager', 'data_entry', 'guest')) NOT NULL
      )
    `);

    // Seed default users if the table is empty
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(rows[0].count) === 0) {
      console.log('Seeding PostgreSQL database with default users...');
      const salt = await bcrypt.genSalt(10);
      const managerPass = await bcrypt.hash('manager123', salt);
      const staffPass = await bcrypt.hash('staff123', salt);
      
      const query = 'INSERT INTO users (username, phone, password, role) VALUES ($1, $2, $3, $4)';
      
      await pool.query(query, ['manager', null, managerPass, 'manager']);
      await pool.query(query, ['staff', null, staffPass, 'data_entry']);
      await pool.query(query, [null, '1234567890', null, 'guest']);
      
      console.log('PostgreSQL database seeded successfully.');
    }
  } catch (err) {
    console.error('Error initializing PostgreSQL database:', err.message);
  }
};

initDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
