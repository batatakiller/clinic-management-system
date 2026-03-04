const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const DiagnosisLog = require("../models/DiagnosisLog");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────────────
// @route   GET /api/analytics/dashboard
// @access  Admin only
// @desc    Get comprehensive admin dashboard statistics
// ─────────────────────────────────────────────────
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalDoctors,
      totalPatients,
      totalReceptionists,
      activeUsers,
      totalAppointments,
      completedAppointments,
      totalPrescriptions,
    ] = await Promise.all([
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "receptionist" }),
      User.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "completed" }),
      Prescription.countDocuments(),
    ]);

    return successResponse(
      res,
      {
        totalDoctors,
        totalPatients,
        totalReceptionists,
        activeUsers,
        totalAppointments,
        completedAppointments,
        appointmentCompletionRate:
          totalAppointments > 0
            ? Math.round((completedAppointments / totalAppointments) * 100)
            : 0,
        totalPrescriptions,
        averagePrescriptionsPerDoctor:
          totalDoctors > 0 ? Math.round(totalPrescriptions / totalDoctors) : 0,
      },
      "Admin dashboard statistics retrieved",
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/analytics/doctor/:doctorId
// @access  Doctor (own), Admin
// @desc    Get doctor-specific analytics
// ─────────────────────────────────────────────────
const getDoctorAnalytics = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    // Authorization: Doctor can only see own stats, Admin can see all
    if (req.user.role === "doctor" && req.user._id.toString() !== doctorId) {
      return errorResponse(res, "You can only view your own analytics.", 403);
    }

    const [
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      prescriptionsWritten,
      diagnosisRecords,
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId }),
      Appointment.countDocuments({ doctorId, status: "completed" }),
      Appointment.countDocuments({ doctorId, status: "cancelled" }),
      Prescription.countDocuments({ doctorId }),
      DiagnosisLog.countDocuments({ doctorId }),
    ]);

    const avgAppointmentDuration = 30; // Placeholder (would need actual duration tracking)

    return successResponse(
      res,
      {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        completionRate:
          totalAppointments > 0
            ? Math.round((completedAppointments / totalAppointments) * 100)
            : 0,
        prescriptionsWritten,
        diagnosisRecords,
        avgPatientsPerDay:
          totalAppointments > 0 ? Math.round(totalAppointments / 20) : 0,
        avgAppointmentDuration,
      },
      "Doctor analytics retrieved",
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/analytics/monthly-appointments
// @access  Admin, Doctor
// @desc    Get appointment trends by month
// ─────────────────────────────────────────────────
const getMonthlyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = appointments.map((item) => ({
      month: months[item._id.month - 1],
      appointments: item.count,
      completed: item.completed,
      cancelled: item.cancelled,
    }));

    return successResponse(res, data, "Monthly appointment trends retrieved");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/analytics/common-diagnoses
// @access  Admin, Doctor
// @desc    Get most common diagnoses
// ─────────────────────────────────────────────────
const getCommonDiagnoses = async (req, res, next) => {
  try {
    const diagnoses = await DiagnosisLog.aggregate([
      {
        $group: {
          _id: "$aiResponse.condition",
          count: { $sum: 1 },
          avgRiskLevel: { $avg: "$aiResponse.riskLevel" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const data = diagnoses
      .filter((item) => item._id)
      .map((item) => ({
        condition: item._id,
        occurrences: item.count,
        severity: item.avgRiskLevel || "unknown",
      }));

    return successResponse(res, data, "Common diagnoses retrieved");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/analytics/patient-forecast
// @access  Admin only
// @desc    Forecast patient load for next week
// ─────────────────────────────────────────────────
const getPatientForecast = async (req, res, next) => {
  try {
    const upcomingAppointments = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const data = upcomingAppointments.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);
      return {
        day: days[date.getDay()],
        date: date.toISOString().split("T")[0],
        forecastedPatients: item.count,
      };
    });

    return successResponse(res, data, "Patient load forecast retrieved");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/analytics/appointment-status
// @access  Admin, Doctor
// @desc    Get appointment status distribution
// ─────────────────────────────────────────────────
const getAppointmentStatus = async (req, res, next) => {
  try {
    const statuses = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const data = statuses.map((item) => ({
      status: item._id || "unknown",
      count: item.count,
      percentage: 0,
    }));

    const total = data.reduce((sum, item) => sum + item.count, 0);
    data.forEach((item) => {
      item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
    });

    return successResponse(
      res,
      data,
      "Appointment status distribution retrieved",
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getDoctorAnalytics,
  getMonthlyAppointments,
  getCommonDiagnoses,
  getPatientForecast,
  getAppointmentStatus,
};
