const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');

async function logLogin(user_id, status) {
  await db.query('INSERT INTO login_history (user_id, status) VALUES (?, ?)', [user_id, status]);
}

async function register(req, res) {
  try {
    const { full_name, email, phone, password } = req.body;
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email or phone already registered' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id)
       VALUES (?, ?, ?, ?, (SELECT role_id FROM roles WHERE role_name = 'Customer'))`,
      [full_name, email, phone, password_hash]
    );
    res.status(201).json({ message: 'Registration successful', user_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query(
      `SELECT u.user_id, u.full_name, u.password_hash, r.role_name
       FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = ?`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logLogin(user.user_id, 'failed');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    await logLogin(user.user_id, 'success');
    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { user_id: user.user_id, full_name: user.full_name, role: user.role_name }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { register, login };