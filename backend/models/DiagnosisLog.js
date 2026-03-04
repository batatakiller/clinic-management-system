const mongoose = require('mongoose');

const diagnosisLogSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Patient is required'],
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Requesting doctor is required'],
        },
        symptoms: {
            type: [String],
            required: [true, 'Symptoms are required'],
            validate: {
                validator: (v) => v.length > 0,
                message: 'At least one symptom is required',
            },
        },
        history: {
            type: String,
            trim: true,
            // Patient's medical history provided as context to AI
        },
        aiResponse: {
            condition: { type: String, default: null },
            riskLevel: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: null,
            },
            recommendations: { type: String, default: null },
            rawResponse: { type: String, default: null }, // Full AI response text for audit
        },
        source: {
            type: String,
            enum: ['gemini', 'openai', 'fallback'],
            default: 'gemini',
        },
        processingTimeMs: {
            type: Number, // How long AI took to respond
            default: null,
        },
        error: {
            type: String, // Error message if AI call failed
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

diagnosisLogSchema.index({ patientId: 1, createdAt: -1 });
diagnosisLogSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model('DiagnosisLog', diagnosisLogSchema);
