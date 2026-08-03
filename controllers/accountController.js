const db = require('../config/db');

function generateAccountNumber() {
  return 'ACC' + Date.now().toString().slice(-10);
}

async function createAccount(req, res) {
  try {
    const { account_type_id } = req.body;
    const user_id = req.user.user_id;

    const account_number = generateAccountNumber();
    const [result] = await db.query(
      `INSERT INTO accounts (account_number, user_id, account_type_id, balance, status)
       VALUES (?, ?, ?, 0.00, 'active')`,
      [account_number, user_id, account_type_id]
    );
    res.status(201).json({ message: 'Account created', account_id: result.insertId, account_number });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getMyAccounts(req, res) {
  try {
    const user_id = req.user.user_id;
    const [accounts] = await db.query(
      'SELECT account_id, account_number, balance, currency, status FROM accounts WHERE user_id = ?',
      [user_id]
    );
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
async function deposit(req, res) {
  const conn = await db.getConnection();
  try {
    const { account_id, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    await conn.beginTransaction();

    const [[account]] = await conn.query(
      'SELECT balance FROM accounts WHERE account_id = ? AND user_id = ? FOR UPDATE',
      [account_id, req.user.user_id]
    );
    if (!account) { await conn.rollback(); return res.status(404).json({ message: 'Account not found' }); }

    const newBalance = Number(account.balance) + Number(amount);
    await conn.query('UPDATE accounts SET balance = ? WHERE account_id = ?', [newBalance, account_id]);

    const ref = 'TXN' + Date.now();
    await conn.query(
      `INSERT INTO transactions (reference_number, source_account_id, transaction_type_id, amount, balance_after_source, status, initiated_by)
       VALUES (?, ?, (SELECT transaction_type_id FROM transaction_types WHERE type_name='deposit'), ?, ?, 'completed', ?)`,
      [ref, account_id, amount, newBalance, req.user.user_id]
    );

    await conn.commit();
    res.json({ message: 'Deposit successful', new_balance: newBalance });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
}

async function withdraw(req, res) {
  const conn = await db.getConnection();
  try {
    const { account_id, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    await conn.beginTransaction();

    const [[account]] = await conn.query(
      'SELECT balance FROM accounts WHERE account_id = ? AND user_id = ? FOR UPDATE',
      [account_id, req.user.user_id]
    );
    if (!account) { await conn.rollback(); return res.status(404).json({ message: 'Account not found' }); }
    if (Number(account.balance) < Number(amount)) {
      await conn.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const newBalance = Number(account.balance) - Number(amount);
    await conn.query('UPDATE accounts SET balance = ? WHERE account_id = ?', [newBalance, account_id]);

    const ref = 'TXN' + Date.now();
    await conn.query(
      `INSERT INTO transactions (reference_number, source_account_id, transaction_type_id, amount, balance_after_source, status, initiated_by)
       VALUES (?, ?, (SELECT transaction_type_id FROM transaction_types WHERE type_name='withdrawal'), ?, ?, 'completed', ?)`,
      [ref, account_id, amount, newBalance, req.user.user_id]
    );

    await conn.commit();
    res.json({ message: 'Withdrawal successful', new_balance: newBalance });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();

    async function transfer(req, res) {
  const conn = await db.getConnection();
  try {
    const { from_account_id, to_account_number, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    await conn.beginTransaction();

    const [[source]] = await conn.query(
      'SELECT balance FROM accounts WHERE account_id = ? AND user_id = ? FOR UPDATE',
      [from_account_id, req.user.user_id]
    );
    if (!source) { await conn.rollback(); return res.status(404).json({ message: 'Source account not found' }); }
    if (Number(source.balance) < Number(amount)) {
      await conn.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const [[dest]] = await conn.query(
      'SELECT account_id, balance FROM accounts WHERE account_number = ? FOR UPDATE',
      [to_account_number]
    );
    if (!dest) { await conn.rollback(); return res.status(404).json({ message: 'Destination account not found' }); }

    const newSourceBal = Number(source.balance) - Number(amount);
    const newDestBal = Number(dest.balance) + Number(amount);

    await conn.query('UPDATE accounts SET balance = ? WHERE account_id = ?', [newSourceBal, from_account_id]);
    await conn.query('UPDATE accounts SET balance = ? WHERE account_id = ?', [newDestBal, dest.account_id]);

    const ref = 'TXN' + Date.now();
    await conn.query(
      `INSERT INTO transactions (reference_number, source_account_id, destination_account_id, transaction_type_id, amount, balance_after_source, status, initiated_by)
       VALUES (?, ?, ?, (SELECT transaction_type_id FROM transaction_types WHERE type_name='transfer'), ?, ?, 'completed', ?)`,
      [ref, from_account_id, dest.account_id, amount, newSourceBal, req.user.user_id]
    );

    await conn.commit();
    res.json({ message: 'Transfer successful', new_balance: newSourceBal });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
}

async function getTransactionHistory(req, res) {
  try {
    const { account_id } = req.params;
    const [txns] = await db.query(
      `SELECT * FROM transactions WHERE source_account_id = ? OR destination_account_id = ? ORDER BY created_at DESC`,
      [account_id, account_id]
    );
    res.json({ transactions: txns });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { createAccount, getMyAccounts, deposit, withdraw, transfer, getTransactionHistory };
