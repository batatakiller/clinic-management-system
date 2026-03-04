const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { verifyToken } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/checkRole");
const validate = require("../middlewares/validate");

router.use(verifyToken);

// Book: Admin, Receptionist, Patient (patients can self-book)
router.post(
  "/",
  checkRole("admin", "receptionist", "patient"),
  [
    body("patientId", "Patient ID is required").isMongoId(),
    body("doctorId", "Doctor ID is required").isMongoId(),
    body("date", "Appointment date is required").isISO8601(),
    body("timeSlot", "Time slot is required").notEmpty().trim(),
    body("reason", "Reason for appointment is required").notEmpty().trim(),
  ],
  validate,
  bookAppointment,
);

// Status update: Doctor + Admin (more specific route - must come BEFORE /:id)
router.put(
  "/:id/status",
  checkRole("admin", "doctor"),
  [
    body("status", "Valid status is required").isIn([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "no_show",
    ]),
  ],
  validate,
  updateAppointmentStatus,
);

// Cancel: Admin, Receptionist, Patient (more specific route - must come BEFORE /:id)
router.put(
  "/:id/cancel",
  checkRole("admin", "receptionist", "patient"),
  cancelAppointment,
);

// All authenticated roles can view appointments (controller enforces role-based filtering)
router.get("/", getAppointments);
router.get("/:id", getAppointmentById);

module.exports = router;
