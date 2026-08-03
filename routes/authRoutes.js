const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post('/transfer', verifyToken, transfer);
router.get('/:account_id/transactions', verifyToken, getTransactionHistory);
module.exports= router;