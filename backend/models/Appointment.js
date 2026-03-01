const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Patient is required'],
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Doctor is required'],
        },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Could be receptionist, patient, or admin
            required: true,
        },
        date: {
            type: Date,
            required: [true, 'Appointment date is required'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Time slot is required'],
            // e.g. "09:00 AM", "02:30 PM"
        },
        reason: {
            type: String,
            required: [true, 'Reason for visit is required'],
            trim: true,
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
            default: 'pending',
        },
        notes: {
            type: String,
            trim: true,
        },
        cancelReason: {
            type: String,
            trim: true,
        },
        followUpDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for common queries
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
