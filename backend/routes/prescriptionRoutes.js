const express = require('express');
const router = express.Router();
const {
    createPrescription,
    getPrescriptionsByPatient,
    getPrescriptionById,
    downloadPrescriptionPDF,
    getMyPrescriptions,
} = require('../controllers/prescriptionController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

router.use(verifyToken);

// Doctor's own prescriptions
router.get('/doctor/my', checkRole('doctor'), getMyPrescriptions);

// Create prescription — Doctor only
router.post('/', checkRole('doctor'), createPrescription);

// View by patient — Doctor, Admin, Patient (own only enforced in controller)
router.get('/patient/:patientId', checkRole('admin', 'doctor', 'patient'), getPrescriptionsByPatient);

// View single prescription
router.get('/:id', checkRole('admin', 'doctor', 'patient'), getPrescriptionById);

// Download PDF
router.get('/:id/pdf', checkRole('admin', 'doctor', 'patient'), downloadPrescriptionPDF);

module.exports = router;
