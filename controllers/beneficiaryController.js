const db = require('../config/db');

async function addBeneficiary(req, res) {
  try {
    const { beneficiary_account_number, beneficiary_name, nickname } = req.body;
    await db.query(
      `INSERT INTO beneficiaries (owner_user_id, beneficiary_account_number, beneficiary_name, nickname)
       VALUES (?, ?, ?, ?)`,
      [req.user.user_id, beneficiary_account_number, beneficiary_name, nickname]
    );
    res.status(201).json({ message: 'Beneficiary added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getBeneficiaries(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM beneficiaries WHERE owner_user_id = ?', [req.user.user_id]);
    res.json({ beneficiaries: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { addBeneficiary, getBeneficiaries };