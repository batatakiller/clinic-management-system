const express = require('express');
const router = express.Router();
const { getAIDiagnosis, getDiagnosisHistory } = require('../controllers/diagnosisController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

router.use(verifyToken);

// AI diagnosis — Doctor only (prevents patient from directly querying AI)
router.post('/suggest', checkRole('doctor'), getAIDiagnosis);

// Diagnosis history — Doctor + Admin
router.get('/history/:patientId', checkRole('admin', 'doctor'), getDiagnosisHistory);

module.exports = router;
