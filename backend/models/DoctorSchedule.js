const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0-6 (Sunday to Saturday)
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String, // HH:mm format, e.g., "09:00"
      required: true,
    },
    endTime: {
      type: String, // HH:mm format, e.g., "17:00"
      required: true,
    },
    slotDuration: {
      type: Number, // in minutes, default 30
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxPatientsPerSlot: {
      type: Number,
      default: 1,
    },
    breakTimes: [
      {
        startTime: String, // HH:mm
        endTime: String, // HH:mm
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Ensure unique schedule per doctor per day
doctorScheduleSchema.index({ doctor: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
