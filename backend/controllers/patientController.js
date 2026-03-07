const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────────────
// @route   GET /api/patients
// @access  Admin, Receptionist, Doctor
// @desc    Get all patients with their profiles
// ─────────────────────────────────────────────────
const getAllPatients = async (req, res, next) => {
  try {
    const { search, bloodGroup, page = 1, limit = 20 } = req.query;
    const filter = { role: "patient", isActive: true };

    // Validate and cap pagination
    const pageNum = Math.max(1, Math.min(Number(page), 1000)); // Max 1000 pages
    const limitNum = Math.max(1, Math.min(Number(limit), 100)); // Max 100 per page

    // Handle bloodGroup filter first (since it's in PatientProfile)
    if (bloodGroup) {
      const profilesWithBloodGroup = await PatientProfile.find({
        bloodGroup,
      }).select("userId");
      const userIdsWithBloodGroup = profilesWithBloodGroup.map((p) => p.userId);
      filter._id = { $in: userIdsWithBloodGroup };
    }

    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };

      // If we already have a bloodGroup filter (_id: { $in: ... }), we must use $and
      if (filter._id) {
        filter.$and = [{ _id: filter._id }, searchFilter];
        delete filter._id;
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    const skip = (pageNum - 1) * limitNum;
    const [patients, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Get profiles for all fetched patients
    const patientIds = patients.map((p) => p._id);
    const profiles = await PatientProfile.find({ userId: { $in: patientIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const patientsWithProfiles = patients.map((patient) => ({
      ...patient,
      profile: profileMap[patient._id.toString()] || null,
    }));

    return successResponse(
      res,
      patientsWithProfiles,
      "Patients retrieved successfully",
      200,
      {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   GET /api/patients/:id
// @access  Admin, Receptionist, Doctor, Patient (own only)
// ─────────────────────────────────────────────────
const getPatientById = async (req, res, next) => {
  try {
    // Security check: Patients can only see their own profile
    if (
      req.user.role === "patient" &&
      req.user._id.toString() !== req.params.id
    ) {
      return errorResponse(
        res,
        "You are not authorized to view this patient profile.",
        403,
      );
    }

    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) return errorResponse(res, "Patient not found.", 404);

    const profile = await PatientProfile.findOne({ userId: patient._id });

    return successResponse(
      res,
      { ...patient.toJSON(), profile },
      "Patient retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   POST /api/patients
// @access  Admin, Receptionist
// @desc    Register a new patient (creates User + PatientProfile)
// ─────────────────────────────────────────────────
const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      chronicConditions,
      notes,
    } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, "Name, email, and password are required.", 400);
    }

    // Validate bloodGroup if provided
    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
      return errorResponse(
        res,
        `Invalid blood group. Must be one of: ${validBloodGroups.join(", ")}`,
        400,
      );
    }

    const existing = await User.findOne({ email });
    if (existing)
      return errorResponse(
        res,
        "A patient with this email already exists.",
        409,
      );

    // Create User account
    const user = await User.create({
      name,
      email,
      password,
      role: "patient",
      phone,
    });

    // Create extended PatientProfile
    const profile = await PatientProfile.create({
      userId: user._id,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      notes,
      registeredBy: req.user._id,
    });

    return successResponse(
      res,
      { user, profile },
      "Patient registered successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   PUT /api/patients/:id
// @access  Admin, Receptionist
// ─────────────────────────────────────────────────
const updatePatient = async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) return errorResponse(res, "Patient not found.", 404);

    const { name, phone } = req.body;
    if (name) patient.name = name;
    if (phone) patient.phone = phone;
    await patient.save();

    // Update profile
    const profileUpdates = {};
    const profileFields = [
      "dateOfBirth",
      "gender",
      "bloodGroup",
      "address",
      "emergencyContact",
      "allergies",
      "chronicConditions",
      "notes",
    ];
    profileFields.forEach((field) => {
      if (req.body[field] !== undefined)
        profileUpdates[field] = req.body[field];
    });

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: patient._id },
      profileUpdates,
      { new: true, upsert: true, runValidators: true },
    );

    return successResponse(
      res,
      { patient, profile },
      "Patient updated successfully",
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
// @route   DELETE /api/patients/:id
// @access  Admin
// ─────────────────────────────────────────────────
const deletePatient = async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) return errorResponse(res, "Patient not found.", 404);

    // Soft delete
    patient.isActive = false;
    await patient.save();

    return successResponse(res, null, "Patient deactivated successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
