const { GoogleGenerativeAI } = require("@google/generative-ai");
const DiagnosisLog = require("../models/DiagnosisLog");
const User = require("../models/User");
const Prescription = require("../models/Prescription");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────────────────────────────────
// AI DIAGNOSIS FALLBACK — returned when AI is unavailable or fails
// ─────────────────────────────────────────────────────────────────────
const FALLBACK_RESPONSE = {
  condition: "Unable to determine — AI service temporarily unavailable",
  riskLevel: "medium",
  recommendations:
    "Please consult a specialist in person for a thorough evaluation. " +
    "The AI diagnostic service is currently experiencing issues. " +
    "Do not make any medical decisions based solely on this response.",
};

// ─────────────────────────────────────────────────────────────────────
// Build the structured prompt for Gemini
// ─────────────────────────────────────────────────────────────────────
const buildDiagnosisPrompt = (symptoms, history) => {
  return `You are an expert medical AI assistant helping a licensed doctor with preliminary diagnosis.
Analyze the following patient information and provide a structured medical assessment.

PATIENT SYMPTOMS:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n")}

PATIENT MEDICAL HISTORY:
${history || "No prior medical history provided."}

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
      return errorResponse(
        res,
        "Please provide at least one symptom as an array.",
        400,
      );
    }

    // Validate symptoms are non-empty strings
    const validSymptoms = symptoms.filter(
      (s) => typeof s === "string" && s.trim().length > 0,
    );
    if (validSymptoms.length === 0) {
      return errorResponse(res, "All symptoms must be non-empty strings.", 400);
    }

    if (!patientId) {
      return errorResponse(res, "patientId is required.", 400);
    }

    const startTime = Date.now();
    let aiData = null;
    let source = "gemini";
    let errorMessage = null;

    // ── Try Gemini API ────────────────────────────────────────────────
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = buildDiagnosisPrompt(symptoms, history);

      // Set a timeout for the AI call
      const aiCallPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("AI request timed out after 15 seconds")),
          15000,
        ),
      );

      const result = await Promise.race([aiCallPromise, timeoutPromise]);
      const rawText = result.response.text().trim();

      // More robust JSON extraction - finds the first { and last }
      const jsonStart = rawText.indexOf("{");
      const jsonEnd = rawText.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("AI response did not contain a valid JSON object");
      }

      const cleanedText = rawText.substring(jsonStart, jsonEnd + 1);
      aiData = JSON.parse(cleanedText);

      // Validate required fields in the response
      if (!aiData.condition || !aiData.riskLevel || !aiData.recommendations) {
        throw new Error("AI response missing required fields");
      }
    } catch (aiError) {
      // ── Graceful Fallback ─────────────────────────────────────────
      console.error(
        `[AI Diagnosis] Falling back to standard response. Reason: ${aiError.message}`,
      );
      aiData = FALLBACK_RESPONSE;
      source = "fallback";
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
      ...(aiData.differentialDiagnoses && {
        differentialDiagnoses: aiData.differentialDiagnoses,
      }),
      ...(aiData.suggestedTests && { suggestedTests: aiData.suggestedTests }),
      ...(aiData.redFlags && { redFlags: aiData.redFlags }),
      disclaimer:
        "This AI analysis is a decision-support tool for licensed medical professionals only. " +
        "It does not replace clinical judgment and must not be used as a sole basis for diagnosis or treatment.",
    };

    const message =
      source === "fallback"
        ? "AI service unavailable. Standard recommendation provided."
        : "AI diagnosis completed successfully.";

    return successResponse(res, responsePayload, message);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/diagnosis/history/:patientId
// @access  Doctor, Admin, Patient (own only)
// @desc    Get AI diagnosis history for a patient
// ─────────────────────────────────────────────────
const getDiagnosisHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Security check: Patients can only see their own history
    if (req.user.role === "patient" && req.user._id.toString() !== patientId) {
      return errorResponse(
        res,
        "You are not authorized to view this diagnosis history.",
        403,
      );
    }

    const logs = await DiagnosisLog.find({ patientId })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

    return successResponse(res, logs, "Diagnosis history retrieved", 200, {
      total: logs.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   POST /api/diagnosis/risk-flag
// @access  Doctor only
// @desc    AI-powered risk flagging for patient conditions
// ─────────────────────────────────────────────────
const flagPatientRisk = async (req, res, next) => {
  try {
    const { patientId, symptoms, history } = req.body;

    if (
      !patientId ||
      !symptoms ||
      !Array.isArray(symptoms) ||
      symptoms.length === 0
    ) {
      return errorResponse(res, "Patient ID and symptoms are required.", 400);
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return errorResponse(res, "Patient not found.", 404);
    }

    const riskFactors = symptoms.filter((symptom) => {
      return ["chest pain", "shortness of breath", "severe headache"].includes(
        symptom.toLowerCase(),
      );
    });

    const riskLevel =
      riskFactors.length > 2
        ? "high"
        : riskFactors.length > 0
          ? "medium"
          : "low";

    const riskLog = await DiagnosisLog.create({
      patientId,
      doctorId: req.user._id,
      symptoms,
      history,
      aiResponse: {
        condition: "Risk Assessment",
        riskLevel,
        recommendations:
          riskLevel === "high"
            ? "Immediate medical attention required."
            : "Monitor symptoms closely.",
      },
      source: "risk-flagging",
    });

    return successResponse(
      res,
      {
        riskId: riskLog._id,
        patientId,
        riskLevel,
        recommendations: riskLog.aiResponse.recommendations,
      },
      "Risk assessment completed successfully.",
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getAIDiagnosis, getDiagnosisHistory, flagPatientRisk };
