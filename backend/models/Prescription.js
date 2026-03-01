const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required'],
        trim: true,
    },
    dosage: {
        type: String,
        required: [true, 'Dosage is required'],
        trim: true,
        // e.g. "500mg", "10ml"
    },
    frequency: {
        type: String,
        required: [true, 'Frequency is required'],
        trim: true,
        // e.g. "Twice daily", "Every 8 hours", "Once at night"
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true,
        // e.g. "5 days", "2 weeks", "1 month"
    },
    instructions: {
        type: String,
        trim: true,
        // e.g. "Take after meals", "Avoid direct sunlight"
    },
});

const prescriptionSchema = new mongoose.Schema(
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
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null,
        },
        diagnosis: {
            type: String,
            required: [true, 'Diagnosis is required'],
            trim: true,
        },
        medicines: {
            type: [medicineSchema],
            validate: {
                validator: (v) => v.length > 0,
                message: 'At least one medicine is required',
            },
        },
        generalInstructions: {
            type: String,
            trim: true,
            // e.g. "Rest for 3 days", "Drink plenty of fluids"
        },
        followUpDate: {
            type: Date,
            default: null,
        },
        isDigitallySigned: {
            type: Boolean,
            default: true,
        },
        pdfUrl: {
            type: String,
            default: null, // Cloudinary URL if uploaded
        },
    },
    {
        timestamps: true,
    }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
