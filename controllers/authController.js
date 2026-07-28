const bcrpyrt = require ('bcrypt');
const db = require ('../config/db');

async function register(req, res) {
    try {
        const { full_name, email, phone, password } = req.body;
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are reuqired'});
        }
        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE email = ? or phone = ?', [email, phone]
        );
         const password_hash = await bcrpt.hash(password, 10);
         const [result] = await db.query(
            `INSERT INTO users (full_name, email, phone, password_hash, role_id)
             VALUES (?, ?, ?, ?, (SELECT role_id FROM roles WHERE role_name = 'Customer'))`,
            [full_name, email, phone, password_hash]
         );
            res.status(201).json({ message: 'Registrastion succesful', user_id: result.inseertID });
        } catch (err) {
            res.status(500).json({mesasgae: 'server error', error: err.messgae});

        }
    }

    module.exports = {register};