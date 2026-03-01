const express = require('express');
const router = express.Router();
const {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
} = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

// All patient routes require authentication
router.use(verifyToken);

// List + Create — Admin & Receptionist only for create, Doctor can view
router.get('/', checkRole('admin', 'receptionist', 'doctor'), getAllPatients);
router.post('/', checkRole('admin', 'receptionist'), createPatient);

// Single patient — Admin, Receptionist, Doctor
router.get('/:id', checkRole('admin', 'receptionist', 'doctor'), getPatientById);
router.put('/:id', checkRole('admin', 'receptionist'), updatePatient);
router.delete('/:id', checkRole('admin'), deletePatient);

module.exports = router;
