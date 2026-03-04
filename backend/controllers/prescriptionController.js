const Prescription = require("../models/Prescription");
const User = require("../models/User");
const { generatePrescriptionPDF } = require("../utils/pdfGenerator");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const axios = require("axios");

// ─────────────────────────────────────────────────
// @route   POST /api/prescriptions
// @access  Doctor only
// @desc    Create a new prescription
// ─────────────────────────────────────────────────
const createPrescription = async (req, res, next) => {
  try {
    const {
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      generalInstructions,
      followUpDate,
    } = req.body;

    if (!patientId || !diagnosis || !medicines || medicines.length === 0) {
      return errorResponse(
        res,
        "patientId, diagnosis, and at least one medicine are required.",
        400,
      );
    }

    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) return errorResponse(res, "Patient not found.", 404);

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      appointmentId: appointmentId || null,
      diagnosis,
      medicines,
      generalInstructions,
      followUpDate,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization licenseNumber phone")
      .populate("appointmentId", "date timeSlot reason");

    return successResponse(
      res,
      populated,
      "Prescription created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/prescriptions/patient/:patientId
// @access  Doctor, Admin (any patient), Patient (own only)
// ─────────────────────────────────────────────────
const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Patients can only see their own prescriptions
    if (req.user.role === "patient" && req.user._id.toString() !== patientId) {
      return errorResponse(
        res,
        "You can only view your own prescriptions.",
        403,
      );
    }

    const prescriptions = await Prescription.find({ patientId })
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization licenseNumber")
      .populate("appointmentId", "date timeSlot")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      res,
      prescriptions,
      "Prescriptions retrieved successfully",
      200,
      { total: prescriptions.length },
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/prescriptions/:id
// @access  Doctor, Admin, Patient (own only)
// ─────────────────────────────────────────────────
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization licenseNumber phone")
      .populate("appointmentId", "date timeSlot reason");

    if (!prescription)
      return errorResponse(res, "Prescription not found.", 404);

    // Patients can only access their own
    if (
      req.user.role === "patient" &&
      prescription.patientId._id.toString() !== req.user._id.toString()
    ) {
      return errorResponse(
        res,
        "You are not authorized to view this prescription.",
        403,
      );
    }

    return successResponse(res, prescription, "Prescription retrieved");
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/prescriptions/:id/pdf
// @access  Doctor, Admin, Patient (own only)
// @desc    Generate and stream prescription PDF
// ─────────────────────────────────────────────────
const downloadPrescriptionPDF = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name email phone specialization licenseNumber");

    if (!prescription)
      return errorResponse(res, "Prescription not found.", 404);

    // Patients can only download their own
    if (
      req.user.role === "patient" &&
      prescription.patientId._id.toString() !== req.user._id.toString()
    ) {
      return errorResponse(
        res,
        "You are not authorized to download this prescription.",
        403,
      );
    }

    const pdfBuffer = await generatePrescriptionPDF(
      prescription,
      prescription.patientId,
      prescription.doctorId,
    );

    const filename = `prescription_${prescription._id}_${Date.now()}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/prescriptions/doctor/my
// @access  Doctor only
// @desc    Get all prescriptions written by the logged-in doctor
// ─────────────────────────────────────────────────
const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user._id })
      .populate("patientId", "name email phone")
      .populate("appointmentId", "date timeSlot")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, prescriptions, "Prescriptions retrieved", 200, {
      total: prescriptions.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   POST /api/prescriptions/:id/explanation
// @access  Patient, Doctor, Admin
// @desc    Get AI-generated patient-friendly explanation
// ─────────────────────────────────────────────────
const getPrescriptionExplanation = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return errorResponse(res, "Prescription not found.", 404);
    }

    // Access control: patients can only see their own
    if (
      req.user.role === "patient" &&
      prescription.patientId.toString() !== req.user._id.toString()
    ) {
      return errorResponse(
        res,
        "You are not authorized to view this prescription explanation.",
        403,
      );
    }

    // Build explanation prompt
    const medicinesText = prescription.medicines
      .map((m) => `${m.name} - ${m.dosage}, ${m.frequency} for ${m.duration}`)
      .join("; ");

    const prompt = `You are a helpful healthcare assistant. Generate a simple, patient-friendly explanation for this prescription:
Diagnosis: ${prescription.diagnosis}
Medicines: ${medicinesText}
${prescription.generalInstructions ? `General Instructions: ${prescription.generalInstructions}` : ""}

Please provide:
1. A simple explanation of the diagnosis in everyday language
2. What each medicine does and why it was prescribed
3. Important lifestyle recommendations
4. When to contact the doctor (warning signs)

Keep the explanation concise and easy to understand.`;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful healthcare assistant that explains medical prescriptions in simple, patient-friendly language.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
            "X-Title": "Healthcare Prescription Explanation",
          },
        },
      );

      const explanation =
        response.data.choices?.[0]?.message?.content ||
        "Unable to generate explanation at this time. Please consult with your doctor directly.";

      return successResponse(
        res,
        {
          prescriptionId: prescription._id,
          diagnosis: prescription.diagnosis,
          explanation: explanation,
          generatedAt: new Date().toISOString(),
        },
        "Prescription explanation generated successfully",
      );
    } catch (aiError) {
      console.error("AI API Error:", aiError.message);
      // Fallback explanation
      const fallbackExplanation = `Your prescription includes ${prescription.medicines.length} medicine(s) to treat ${prescription.diagnosis}. Please follow the dosage and frequency as prescribed by your doctor. If you experience any unusual symptoms, contact your healthcare provider immediately.`;

      return successResponse(
        res,
        {
          prescriptionId: prescription._id,
          diagnosis: prescription.diagnosis,
          explanation: fallbackExplanation,
          source: "fallback",
          generatedAt: new Date().toISOString(),
        },
        "Prescription explanation generated (standard format)",
      );
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  downloadPrescriptionPDF,
  getMyPrescriptions,
  getPrescriptionExplanation,
};
