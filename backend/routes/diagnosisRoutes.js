const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAIDiagnosis, getDiagnosisHistory } = require('../controllers/diagnosisController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');
const validate = require('../middlewares/validate');

router.use(verifyToken);

// AI diagnosis — Doctor only (prevents patient from directly querying AI)
router.post(
    '/suggest',
    checkRole('doctor'),
    [
        body('patientId', 'Patient ID is required').isMongoId(),
        body('symptoms', 'Symptoms must be an array').isArray({ min: 1 }),
        body('history', 'Medical history is recommended').optional().isString(),
    ],
    validate,
    getAIDiagnosis
);

// Diagnosis history — Doctor + Admin + Patient (own only enforced in controller)
router.get('/history/:patientId', checkRole('admin', 'doctor', 'patient'), getDiagnosisHistory);

module.exports = router;
