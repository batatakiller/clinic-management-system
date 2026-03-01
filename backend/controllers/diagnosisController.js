const { GoogleGenerativeAI } = require('@google/generative-ai');
const DiagnosisLog = require('../models/DiagnosisLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────────────────
// AI DIAGNOSIS FALLBACK — returned when AI is unavailable or fails
// ─────────────────────────────────────────────────────────────────────
const FALLBACK_RESPONSE = {
    condition: 'Unable to determine — AI service temporarily unavailable',
    riskLevel: 'medium',
    recommendations:
        'Please consult a specialist in person for a thorough evaluation. ' +
        'The AI diagnostic service is currently experiencing issues. ' +
        'Do not make any medical decisions based solely on this response.',
};

// ─────────────────────────────────────────────────────────────────────
// Build the structured prompt for Gemini
// ─────────────────────────────────────────────────────────────────────
const buildDiagnosisPrompt = (symptoms, history) => {
    return `You are an expert medical AI assistant helping a licensed doctor with preliminary diagnosis.
Analyze the following patient information and provide a structured medical assessment.

PATIENT SYMPTOMS:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

PATIENT MEDICAL HISTORY:
${history || 'No prior medical history provided.'}

IMPORTANT INSTRUCTIONS:
- You are assisting a licensed doctor, NOT replacing one.
- Be precise and medically accurate.
- Respond ONLY with valid JSON in the exact format below — no markdown, no extra text.

{
  "condition": "Most likely condition name",
  "riskLevel": "low" | "medium" | "high" | "critical",
  "recommendations": "Clear, actionable recommendations for the doctor",
  "differentialDiagnoses": ["Alternative condition 1", "Alternative condition 2"],
  "suggestedTests": ["Test 1", "Test 2"],
  "redFlags": ["Warning sign 1 if any"]
}`;
};

// ─────────────────────────────────────────────────
// @route   POST /api/diagnosis/suggest
// @access  Doctor only
// @desc    Get AI-powered diagnosis suggestion
// ─────────────────────────────────────────────────
const getAIDiagnosis = async (req, res, next) => {
    try {
        const { symptoms, history, patientId } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return errorResponse(res, 'Please provide at least one symptom as an array.', 400);
        }

        if (!patientId) {
            return errorResponse(res, 'patientId is required.', 400);
        }

        const startTime = Date.now();
        let aiData = null;
        let source = 'gemini';
        let errorMessage = null;

        // ── Try Gemini API ────────────────────────────────────────────────
        try {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is not configured');
            }

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = buildDiagnosisPrompt(symptoms, history);

            // Set a timeout for the AI call
            const aiCallPromise = model.generateContent(prompt);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('AI request timed out after 15 seconds')), 15000)
            );

            const result = await Promise.race([aiCallPromise, timeoutPromise]);
            const rawText = result.response.text().trim();

            // Parse the JSON response from Gemini
            // Remove potential markdown code fences if the model wraps in ```json
            const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
            aiData = JSON.parse(cleanedText);

            // Validate required fields in the response
            if (!aiData.condition || !aiData.riskLevel || !aiData.recommendations) {
                throw new Error('AI response missing required fields');
            }
        } catch (aiError) {
            // ── Graceful Fallback ─────────────────────────────────────────
            console.error(`[AI Diagnosis] Falling back to standard response. Reason: ${aiError.message}`);
            aiData = FALLBACK_RESPONSE;
            source = 'fallback';
            errorMessage = aiError.message;
        }

        const processingTimeMs = Date.now() - startTime;

        // ── Save to DiagnosisLog regardless of source ─────────────────────
        const diagnosisLog = await DiagnosisLog.create({
            patientId,
            doctorId: req.user._id,
            symptoms,
            history,
            aiResponse: {
                condition: aiData.condition,
                riskLevel: aiData.riskLevel,
                recommendations: aiData.recommendations,
                rawResponse: JSON.stringify(aiData),
            },
            source,
            processingTimeMs,
            error: errorMessage,
        });

        const responsePayload = {
            diagnosisId: diagnosisLog._id,
            source,
            processingTimeMs,
            condition: aiData.condition,
            riskLevel: aiData.riskLevel,
            recommendations: aiData.recommendations,
            ...(aiData.differentialDiagnoses && { differentialDiagnoses: aiData.differentialDiagnoses }),
            ...(aiData.suggestedTests && { suggestedTests: aiData.suggestedTests }),
            ...(aiData.redFlags && { redFlags: aiData.redFlags }),
            disclaimer:
                'This AI analysis is a decision-support tool for licensed medical professionals only. ' +
                'It does not replace clinical judgment and must not be used as a sole basis for diagnosis or treatment.',
        };

        const message =
            source === 'fallback'
                ? 'AI service unavailable. Standard recommendation provided.'
                : 'AI diagnosis completed successfully.';

        return successResponse(res, responsePayload, message);
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   GET /api/diagnosis/history/:patientId
// @access  Doctor, Admin
// @desc    Get AI diagnosis history for a patient
// ─────────────────────────────────────────────────
const getDiagnosisHistory = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        const logs = await DiagnosisLog.find({ patientId })
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        return successResponse(res, logs, 'Diagnosis history retrieved', 200, { total: logs.length });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAIDiagnosis, getDiagnosisHistory };
