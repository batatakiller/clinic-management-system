const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            zipCode: { type: String, trim: true },
            country: { type: String, trim: true, default: 'Pakistan' },
        },
        emergencyContact: {
            name: { type: String, trim: true },
            relationship: { type: String, trim: true },
            phone: { type: String, trim: true },
        },
        allergies: [
            {
                type: String,
                trim: true,
            },
        ],
        chronicConditions: [
            {
                type: String,
                trim: true,
            },
        ],
        currentMedications: [
            {
                name: { type: String, trim: true },
                dosage: { type: String, trim: true },
            },
        ],
        avatar: {
            url: { type: String, default: null },
            publicId: { type: String, default: null }, // Cloudinary public_id for deletion
        },
        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // The receptionist or admin who registered this patient
        },
        notes: {
            type: String, // General notes about the patient
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
