const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');

// Public routes
router.post(
    '/register',
    [
        body('name', 'Name is required').notEmpty().trim(),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        body('role', 'Invalid role').optional().isIn(['patient', 'receptionist']),
    ],
    validate,
    register
);

router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password is required').exists(),
    ],
    validate,
    login
);

// Protected routes
router.use(verifyToken);

router.get('/me', getMe);

router.put(
    '/change-password',
    [
        body('currentPassword', 'Current password is required').exists(),
        body('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 }),
    ],
    validate,
    changePassword
);

router.put(
    '/profile',
    upload.single('profileImage'),
    [
        body('name', 'Name cannot be empty').optional().notEmpty().trim(),
    ],
    validate,
    updateProfile
);

module.exports = router;
