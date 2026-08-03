const db = require('../config/db');

async function getAllUsers(req, res) {
  try {
    const [users] = await db.query('SELECT user_id, full_name, email, is_active FROM users');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getAllAccounts(req, res) {
  try {
    const [accounts] = await db.query('SELECT * FROM accounts');
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { getAllUsers, getAllAccounts };