const bcrypt = require('bcryptjs');
const { getPool } = require('../src/config/database');

async function syncUsers() {
  const pool = getPool();

  const hashManager = await bcrypt.hash('Manager@123', 10);
  const hashOps = await bcrypt.hash('Ops@123', 10);
  const hashGuest = await bcrypt.hash('Guest@123', 10);

  const usersToAdd = [
    { email: 'manager@smartresort360.com', role: 'RESORT_MANAGER', hash: hashManager },
    { email: 'manager@smartresort.com', role: 'RESORT_MANAGER', hash: hashManager },
    { email: 'ops@smartresort360.com', role: 'OPERATIONS_MANAGER', hash: hashOps },
    { email: 'ops@smartresort.com', role: 'OPERATIONS_MANAGER', hash: hashOps },
    { email: 'rahul.sharma@example.com', role: 'GUEST', hash: hashGuest },
    { email: 'priya.patel@example.com', role: 'GUEST', hash: hashGuest },
    { email: 'arjun.mehta@example.com', role: 'GUEST', hash: hashGuest }
  ];

  for (const u of usersToAdd) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
    if (existing.rows.length > 0) {
      await pool.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [u.hash, u.role, u.email]);
      console.log('Updated user:', u.email);
    } else {
      await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [u.email, u.hash, u.role]);
      console.log('Inserted user:', u.email);
    }
  }

  // Ensure guest table records for Rahul and Priya
  const rahulRes = await pool.query('SELECT id FROM users WHERE email = $1', ['rahul.sharma@example.com']);
  const priyaRes = await pool.query('SELECT id FROM users WHERE email = $1', ['priya.patel@example.com']);

  const rGuest = await pool.query('SELECT id FROM guests WHERE email = $1', ['rahul.sharma@example.com']);
  if (rGuest.rows.length === 0) {
    await pool.query(
      `INSERT INTO guests (user_id, name, email, phone, loyalty_tier, total_stays, special_requirements)
       VALUES ($1, 'Rahul Sharma', 'rahul.sharma@example.com', '+91 98201 12345', 'GOLD', 4, 'High floor, vegetarian meals')`,
      [rahulRes.rows[0].id]
    );
    console.log('Created guest profile for Rahul Sharma');
  }

  const pGuest = await pool.query('SELECT id FROM guests WHERE email = $1', ['priya.patel@example.com']);
  if (pGuest.rows.length === 0) {
    await pool.query(
      `INSERT INTO guests (user_id, name, email, phone, loyalty_tier, total_stays, special_requirements)
       VALUES ($1, 'Priya Patel', 'priya.patel@example.com', '+91 98202 67890', 'PLATINUM', 8, 'Quiet room, ocean view')`,
      [priyaRes.rows[0].id]
    );
    console.log('Created guest profile for Priya Patel');
  }

  console.log('✅ User credentials and guest profiles synchronized successfully!');
  process.exit(0);
}

syncUsers().catch(err => {
  console.error('Error synchronizing users:', err);
  process.exit(1);
});
