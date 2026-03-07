const DoctorSchedule = require("../models/DoctorSchedule");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get all schedules for a doctor
 */
exports.getDoctorSchedule = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const schedules = await DoctorSchedule.find({ doctor: doctorId })
      .populate("doctor", "name specialization")
      .sort("dayOfWeek");

    return successResponse(
      res,
      schedules,
      "Doctor schedule retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update a schedule slot for a doctor
 */
exports.createOrUpdateSchedule = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { dayOfWeek, startTime, endTime, slotDuration, breakTimes } =
      req.body;

    // Validation
    if (
      !dayOfWeek ||
      typeof dayOfWeek !== "number" ||
      dayOfWeek < 0 ||
      dayOfWeek > 6
    ) {
      return errorResponse(res, "Invalid day of week (0-6)", 400);
    }

    if (!startTime || !endTime) {
      return errorResponse(res, "Start time and end time are required", 400);
    }

    // Check if schedule already exists for this day
    const existing = await DoctorSchedule.findOne({
      doctor: doctorId,
      dayOfWeek,
    });

    const scheduleData = {
      doctor: doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration: slotDuration || 30,
      breakTimes: breakTimes || [],
      isActive: true,
    };

    let schedule;
    if (existing) {
      schedule = await DoctorSchedule.findByIdAndUpdate(
        existing._id,
        scheduleData,
        { new: true },
      );
    } else {
      schedule = await DoctorSchedule.create(scheduleData);
    }

    return successResponse(res, schedule, "Schedule saved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a schedule
 */
exports.deleteSchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await DoctorSchedule.findByIdAndDelete(scheduleId);

    if (!schedule) {
      return errorResponse(res, "Schedule not found", 404);
    }

    return successResponse(res, null, "Schedule deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get available time slots for a doctor on a specific date
 */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return errorResponse(res, "Doctor ID and date are required", 400);
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Get doctor's schedule for this day
    const schedule = await DoctorSchedule.findOne({
      doctor: doctorId,
      dayOfWeek,
      isActive: true,
    });

    if (!schedule) {
      return successResponse(res, [], "No schedule available for this day");
    }

    // Generate time slots
    const slots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration,
      schedule.breakTimes,
    );

    // Get already booked appointments for this date
    const Appointment = require("../models/Appointment");
    const bookedAppointments = await Appointment.find({
      doctorId: doctorId,
      date: {
        $gte: new Date(`${date}T00:00:00`),
        $lt: new Date(`${date}T23:59:59`),
      },
      status: { $in: ["pending", "confirmed"] },
    });

    // Mark unavailable slots
    const availableSlots = slots.map((slot) => {
      const isBooked = bookedAppointments.some(
        (apt) => apt.timeSlot === slot && apt.patientId,
      );
      return {
        time: slot,
        available: !isBooked,
        availablespots: schedule.maxPatientsPerSlot - (isBooked ? 1 : 0),
      };
    });

    return successResponse(res, availableSlots, "Available slots retrieved");
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to generate time slots
 */
function generateTimeSlots(startTime, endTime, duration, breakTimes = []) {
  const slots = [];
  let current = timeStringToMinutes(startTime);
  const end = timeStringToMinutes(endTime);

  while (current < end) {
    const slotEnd = current + duration;
    if (slotEnd > end) break;

    const timeStr = minutesToTimeString(current);

    // Check if slot falls within break time
    const inBreak = breakTimes.some(
      (br) =>
        timeStringToMinutes(br.startTime) <= current &&
        timeStringToMinutes(br.endTime) > current,
    );

    if (!inBreak) {
      slots.push(timeStr);
    }

    current = slotEnd;
  }

  return slots;
}

function timeStringToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeString(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
