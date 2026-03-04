const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  downloadPrescriptionPDF,
  getMyPrescriptions,
  getPrescriptionExplanation,
} = require("../controllers/prescriptionController");
const { verifyToken } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/checkRole");
const validate = require("../middlewares/validate");

router.use(verifyToken);

// Doctor's own prescriptions (more specific - before generic routes)
router.get("/doctor/my", checkRole("doctor"), getMyPrescriptions);

// View by patient (more specific - before generic /:id))
router.get(
  "/patient/:patientId",
  checkRole("admin", "doctor", "patient"),
  getPrescriptionsByPatient,
);

// Create prescription — Doctor only
router.post(
  "/",
  checkRole("doctor"),
  [
    body("patientId", "Patient ID is required").isMongoId(),
    body("diagnosis", "Diagnosis is required").notEmpty().trim(),
    body("medicines", "Medicines must be an array").isArray({ min: 1 }),
    body("medicines.*.name", "Medicine name is required").notEmpty().trim(),
    body("medicines.*.dosage", "Medicine dosage is required").notEmpty().trim(),
    body("medicines.*.frequency", "Medicine frequency is required")
      .notEmpty()
      .trim(),
    body("medicines.*.duration", "Medicine duration is required")
      .notEmpty()
      .trim(),
  ],
  validate,
  createPrescription,
);

// Download PDF (more specific - must come BEFORE /:id)
router.get(
  "/:id/pdf",
  checkRole("admin", "doctor", "patient"),
  downloadPrescriptionPDF,
);

// Prescription explanation (more specific - must come BEFORE /:id)
router.post(
  "/:id/explanation",
  checkRole("admin", "doctor", "patient"),
  getPrescriptionExplanation,
);

// View single prescription (generic - comes last)
router.get(
  "/:id",
  checkRole("admin", "doctor", "patient"),
  getPrescriptionById,
);

module.exports = router;
