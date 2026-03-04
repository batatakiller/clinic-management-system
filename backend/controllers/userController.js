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

// @route   GET /api/users/:id
// @access  Admin, Doctor, Receptionist
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return errorResponse(res, 'User not found.', 404);
        return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
        next(error);
    }
};

// @route   PUT /api/users/staff/:id
// @access  Admin
const updateStaff = async (req, res, next) => {
    try {
        const { name, phone, isActive } = req.body;

        const staff = await User.findOne({ _id: req.params.id, role: 'receptionist' });
        if (!staff) return errorResponse(res, 'Staff member not found.', 404);

        if (name) staff.name = name;
        if (phone) staff.phone = phone;
        if (isActive !== undefined) staff.isActive = isActive;

        await staff.save();
        return successResponse(res, staff, 'Staff member updated successfully');
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/users/staff/:id
// @access  Admin
const deleteStaff = async (req, res, next) => {
    try {
        const staff = await User.findOne({ _id: req.params.id, role: 'receptionist' });
        if (!staff) return errorResponse(res, 'Staff member not found.', 404);

        // Soft delete
        staff.isActive = false;
        await staff.save();

        return successResponse(res, null, 'Staff member deactivated successfully');
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

// ─────────────────────────────────────────────────
// GENERIC USER MANAGEMENT (Admin only)
// ─────────────────────────────────────────────────

// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
    try {
        const { name, email, phone, isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return errorResponse(res, 'User not found.', 404);

        // Prevent changing role through this endpoint
        if (['doctor', 'receptionist'].includes(user.role)) {
            return errorResponse(res, 'Use specific endpoint for this user type.', 400);
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();
        return successResponse(res, user, 'User updated successfully');
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return errorResponse(res, 'User not found.', 404);

        // Prevent deleting doctors/staff through this endpoint
        if (['doctor', 'receptionist'].includes(user.role)) {
            return errorResponse(res, 'Use specific endpoint for this user type.', 400);
        }

        // Soft delete
        user.isActive = false;
        await user.save();

        return successResponse(res, null, 'User deactivated successfully');
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
    getUserById,
    updateStaff,
    deleteStaff,
    getDashboardStats,
    updateUser,
    deleteUser,
};
