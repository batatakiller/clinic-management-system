const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────
// DOCTOR MANAGEMENT (Admin only)
// ─────────────────────────────────────────────────

// @route   GET /api/users/doctors
// @access  Admin
const getAllDoctors = async (req, res, next) => {
    try {
        const { search, specialization, isActive } = req.query;
        const filter = { role: 'doctor' };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const doctors = await User.find(filter).sort({ createdAt: -1 });
        return successResponse(res, doctors, 'Doctors retrieved successfully', 200, { total: doctors.length });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/users/doctors
// @access  Admin
const createDoctor = async (req, res, next) => {
    try {
        const { name, email, password, phone, specialization, licenseNumber } = req.body;

        if (!name || !email || !password) {
            return errorResponse(res, 'Name, email, and password are required.', 400);
        }

        const existing = await User.findOne({ email });
        if (existing) return errorResponse(res, 'A user with this email already exists.', 409);

        const doctor = await User.create({
            name,
            email,
            password,
            role: 'doctor',
            phone,
            specialization,
            licenseNumber,
        });

        return successResponse(res, doctor, 'Doctor account created successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/users/doctors/:id
// @access  Admin
const updateDoctor = async (req, res, next) => {
    try {
        const { name, phone, specialization, licenseNumber, isActive } = req.body;

        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
        if (!doctor) return errorResponse(res, 'Doctor not found.', 404);

        if (name) doctor.name = name;
        if (phone) doctor.phone = phone;
        if (specialization) doctor.specialization = specialization;
        if (licenseNumber) doctor.licenseNumber = licenseNumber;
        if (isActive !== undefined) doctor.isActive = isActive;

        await doctor.save();
        return successResponse(res, doctor, 'Doctor updated successfully');
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/users/doctors/:id
// @access  Admin
const deleteDoctor = async (req, res, next) => {
    try {
        const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
        if (!doctor) return errorResponse(res, 'Doctor not found.', 404);

        // Soft delete — deactivate instead of hard delete to preserve data integrity
        doctor.isActive = false;
        await doctor.save();

        return successResponse(res, null, 'Doctor deactivated successfully');
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// STAFF MANAGEMENT (Admin only)
// ─────────────────────────────────────────────────

// @route   GET /api/users/staff
// @access  Admin
const getAllStaff = async (req, res, next) => {
    try {
        const staff = await User.find({ role: 'receptionist' }).sort({ createdAt: -1 });
        return successResponse(res, staff, 'Staff retrieved successfully', 200, { total: staff.length });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/users/staff
// @access  Admin
const createStaff = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return errorResponse(res, 'Name, email, and password are required.', 400);
        }

        const existing = await User.findOne({ email });
        if (existing) return errorResponse(res, 'A user with this email already exists.', 409);

        const staff = await User.create({ name, email, password, role: 'receptionist', phone });
        return successResponse(res, staff, 'Staff account created successfully', 201);
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/users/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
    try {
        const [totalDoctors, totalPatients, totalReceptionists, activeUsers] = await Promise.all([
            User.countDocuments({ role: 'doctor' }),
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'receptionist' }),
            User.countDocuments({ isActive: true }),
        ]);

        return successResponse(res, {
            totalDoctors,
            totalPatients,
            totalReceptionists,
            activeUsers,
        }, 'Dashboard stats retrieved');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getAllStaff,
    createStaff,
    getDashboardStats,
};
