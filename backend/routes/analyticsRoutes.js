const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getDoctorAnalytics,
  getMonthlyAppointments,
  getCommonDiagnoses,
  getPatientForecast,
  getAppointmentStatus,
} = require("../controllers/analyticsController");
const { verifyToken } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/checkRole");

// All analytics routes require authentication
router.use(verifyToken);

// Admin analytics
router.get("/dashboard", checkRole("admin"), getAdminDashboard);

// Doctor analytics (own or admin view)
router.get(
  "/doctor/:doctorId",
  checkRole("admin", "doctor"),
  getDoctorAnalytics,
);

// Trends and forecasting
router.get(
  "/monthly-appointments",
  checkRole("admin", "doctor"),
  getMonthlyAppointments,
);
router.get(
  "/common-diagnoses",
  checkRole("admin", "doctor"),
  getCommonDiagnoses,
);
router.get("/patient-forecast", checkRole("admin"), getPatientForecast);
router.get(
  "/appointment-status",
  checkRole("admin", "doctor"),
  getAppointmentStatus,
);

module.exports = router;
