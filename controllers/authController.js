const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');

async function register(req, res) {
    try {
        const { full_name, email, phone, password } = req.body;
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email or phone is already registered' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            `INSERT INTO users (full_name, email, phone, password_hash, role_id)
             VALUES (?, ?, ?, ?, (SELECT role_id FROM roles WHERE role_name = 'Customer'))`,
            [full_name, email, phone, password_hash]
        );

        const token = generateToken({ id: result.insertId, role_name: 'Customer' });

        res.status(201).json({
            message: 'Registration successful',
            user_id: result.insertId,
            token
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [rows] = await db.query(
            `SELECT u.user_id, u.password_hash, r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.email = ? OR u.phone = ?`,
            [email, email]
        );

        const user = rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user.user_id, role_name: user.role_name });

        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { register, login };