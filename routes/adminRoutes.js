const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { getAllUsers, getAllAccounts } = require('../controllers/adminController');

router.get('/users', verifyToken, authorizeRoles('Admin'), getAllUsers);
router.get('/accounts', verifyToken, authorizeRoles('Admin'), getAllAccounts);

module.exports = router;