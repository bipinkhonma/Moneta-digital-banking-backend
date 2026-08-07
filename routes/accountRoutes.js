const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createAccount, getMyAccounts, deposit, withdraw, transfer, getTransactionHistory } = require('../controllers/accountController');

router.post('/', verifyToken, createAccount);
router.get('/', verifyToken, getMyAccounts);
router.post('/deposit', verifyToken, deposit);
router.post('/withdraw', verifyToken, withdraw);
router.post('/transfer', verifyToken, transfer);
router.get('/:account_id/transactions', verifyToken, getTransactionHistory);

module.exports = router;