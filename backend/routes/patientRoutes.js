const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
} = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');
const validate = require('../middlewares/validate');

// All patient routes require authentication
router.use(verifyToken);

// List + Create — Admin & Receptionist only for create, Doctor can view
router.get('/', checkRole('admin', 'receptionist', 'doctor'), getAllPatients);

router.post(
    '/',
    checkRole('admin', 'receptionist'),
    [
        body('name', 'Name is required').notEmpty().trim(),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        body('phone', 'Phone is required').notEmpty().trim(),
    ],
    validate,
    createPatient
);

// Single patient — Admin, Receptionist, Doctor, Patient (own only enforced in controller)
router.get('/:id', checkRole('admin', 'receptionist', 'doctor', 'patient'), getPatientById);

router.put(
    '/:id',
    checkRole('admin', 'receptionist'),
    [
        body('name', 'Name cannot be empty').optional().notEmpty().trim(),
        body('phone', 'Phone cannot be empty').optional().notEmpty().trim(),
    ],
    validate,
    updatePatient
);

router.delete('/:id', checkRole('admin'), deletePatient);

module.exports = router;
