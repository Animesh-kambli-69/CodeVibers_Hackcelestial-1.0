const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'supersecretkey123'; // In a real app, use environment variables

// Middleware
app.use(cors());
app.use(express.json());

// --- Authentication Routes ---

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { loginType, username, password, phone } = req.body;
  
  try {
    if (loginType === 'staff') {
      // Manager or Data Entry
      const { rows } = await db.query('SELECT * FROM users WHERE username = $1 AND role IN (\'manager\', \'data_entry\')', [username]);
      const user = rows[0];
      
      if (!user) return res.status(401).json({ success: false, message: 'Invalid username or password' });
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid username or password' });
      
      const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
    } else if (loginType === 'guest') {
      // Guest
      const { rows } = await db.query('SELECT * FROM users WHERE phone = $1 AND role = \'guest\'', [phone]);
      const user = rows[0];
      
      if (!user) return res.status(401).json({ success: false, message: 'No guest found with this phone number.' });
      
      const token = jwt.sign({ id: user.id, role: user.role, phone: user.phone }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ success: true, token, user: { id: user.id, phone: user.phone, role: user.role } });
    } else {
      res.status(400).json({ success: false, message: 'Invalid login type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Middleware to verify token and roles
const verifyTokenAndRole = (roles) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });
      
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Access forbidden. You do not have the required role.' });
      }
      
      req.user = decoded;
      next();
    });
  };
};

// API endpoint for the "Schedule a Consult" CTA - Protected to any logged in user
app.post('/api/consult', verifyTokenAndRole(['manager', 'data_entry', 'guest']), (req, res) => {
  // In a real app, logic depends on user role
  console.log(`Received consult request from user ID: ${req.user.id}, Role: ${req.user.role}`);
  
  res.status(200).json({ 
    success: true, 
    message: `Consultation request received successfully for role: ${req.user.role}.` 
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Resort AI backend is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
