const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getDoctorSchedule,
  createOrUpdateSchedule,
  deleteSchedule,
  getAvailableSlots,
} = require("../controllers/scheduleController");
const { verifyToken } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/checkRole");
const validate = require("../middlewares/validate");

// All schedule routes require authentication
router.use(verifyToken);

/**
 * GET /api/schedules/available-slots
 * Get available time slots for a doctor on a specific date
 * Query params: doctorId (required), date (required, YYYY-MM-DD format)
 * Accessible by: all authenticated users
 */
router.get("/available-slots", getAvailableSlots);

/**
 * GET /api/schedules/doctor/:doctorId
 * Get schedule for a doctor
 * Params: doctorId (required)
 * Accessible by: all authenticated users
 */
router.get("/doctor/:doctorId", getDoctorSchedule);

/**
 * POST /api/schedules/doctor/:doctorId
 * Create or update schedule for a doctor
 * Params: doctorId (required)
 * Body: dayOfWeek, startTime, endTime, slotDuration, breakTimes
 * Accessible by: admin or the doctor themselves
 */
router.post(
  "/doctor/:doctorId",
  checkRole("admin", "doctor"),
  [
    body("dayOfWeek")
      .isInt({ min: 0, max: 6 })
      .withMessage("Day of week must be between 0-6"),
    body("startTime")
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("Start time must be in HH:mm format"),
    body("endTime")
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("End time must be in HH:mm format"),
    body("slotDuration")
      .optional()
      .isInt({ min: 15, max: 180 })
      .withMessage("Slot duration must be between 15-180 minutes"),
  ],
  validate,
  createOrUpdateSchedule,
);

/**
 * DELETE /api/schedules/:scheduleId
 * Delete a schedule
 * Params: scheduleId (required)
 * Accessible by: admin or the doctor who owns the schedule
 */
router.delete("/:scheduleId", checkRole("admin", "doctor"), deleteSchedule);

module.exports = router;
