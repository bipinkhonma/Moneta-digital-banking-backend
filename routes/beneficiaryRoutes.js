const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { addBeneficiary, getBeneficiaries } = require('../controllers/beneficiaryController');

router.post('/', verifyToken, addBeneficiary);
router.get('/', verifyToken, getBeneficiaries);

module.exports = router;