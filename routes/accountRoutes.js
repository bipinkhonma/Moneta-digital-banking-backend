const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createAccount, getMyAccounts } = require('../controllers/accountController');

router.post('/', verifyToken, createAccount);
router.get('/', verifyToken, getMyAccounts);

module.exports = router;