const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { getAllUsers, getAllAccounts, updateAccountStatus } = require('../controllers/adminController');

router.get('/users', verifyToken, authorizeRoles('Admin'), getAllUsers);
router.get('/accounts', verifyToken, authorizeRoles('Admin'), getAllAccounts);
router.put('/accounts/status', verifyToken, authorizeRoles('Admin'), updateAccountStatus);

module.exports = router;