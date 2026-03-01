const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment,
} = require('../controllers/appointmentController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

router.use(verifyToken);

// All authenticated roles can view appointments (controller enforces role-based filtering)
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);

// Book: Admin, Receptionist, Patient (patients can self-book)
router.post('/', checkRole('admin', 'receptionist', 'patient'), bookAppointment);

// Status update: Doctor + Admin
router.put('/:id/status', checkRole('admin', 'doctor'), updateAppointmentStatus);

// Cancel: Admin, Receptionist, Patient (controller enforces own-only for patient)
router.put('/:id/cancel', checkRole('admin', 'receptionist', 'patient'), cancelAppointment);

module.exports = router;
