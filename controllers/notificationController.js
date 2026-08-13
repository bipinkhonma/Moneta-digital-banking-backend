const db = require('../config/db');

async function createNotification(user_id, title, message) {
    await db.query('INSERT INTO notifications (user_id, title, message) VALUES (?,?,?)', [user_id, title, message]);
}

async function getMyNotifications(req, res) {
    try {
        const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json({ notifications: rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
  }

    module.exports = { createNotification, getMyNotifications };