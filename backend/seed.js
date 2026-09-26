const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/resort_db',
});

const injectDummyData = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordStaff = await bcrypt.hash('password123', salt);

  const dummyUsers = [
    { username: 'john_manager', phone: '1111111111', password: passwordStaff, role: 'manager' },
    { username: 'alice_entry', phone: '2222222222', password: passwordStaff, role: 'data_entry' },
    { username: null, phone: '9876543210', password: null, role: 'guest' },
    { username: null, phone: '5555555555', password: null, role: 'guest' }
  ];

  try {
    const query = 'INSERT INTO users (username, phone, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING';
    
    for (const user of dummyUsers) {
      await pool.query(query, [user.username, user.phone, user.password, user.role]);
    }
    
    console.log('Dummy data injected successfully!');
    
    const { rows } = await pool.query('SELECT id, username, phone, role FROM users');
    console.log('\nCurrent Users in Database:');
    console.table(rows);
  } catch (err) {
    console.error('Error injecting dummy data:', err.message);
  } finally {
    pool.end();
  }
};

injectDummyData();
