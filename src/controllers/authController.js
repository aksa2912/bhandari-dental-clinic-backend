const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In a real app, this should be in your .env file. We will move it on Day 10.
const JWT_SECRET = 'super-secret-key-change-in-production';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // 1. Find the user by email
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Compare the provided password with the hashed password in DB
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    // 4. Send the token in an HTTP-only cookie
    res.cookie('adminToken', token, {
      httpOnly: true, // Prevents JS from reading the cookie (stops XSS attacks)
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict', 
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
const logout = (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/' // The path must match the path used when setting the cookie
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { login, logout };