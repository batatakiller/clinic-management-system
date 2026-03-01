const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
