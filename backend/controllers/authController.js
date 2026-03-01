const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new user (default role: patient)
// ─────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone, specialization, licenseNumber } = req.body;

        // Prevent public registration of admin/doctor — those must be created by admin
        const allowedPublicRoles = ['patient', 'receptionist'];
        const assignedRole = role && allowedPublicRoles.includes(role) ? role : 'patient';

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 'An account with this email already exists.', 409);
        }

        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
            phone,
            ...(assignedRole === 'doctor' && { specialization, licenseNumber }),
        });

        const token = generateToken(user._id, user.role);

        return successResponse(
            res,
            {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                },
            },
            'Account created successfully',
            201
        );
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// @desc    Login and get JWT token
// ─────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, 'Please provide both email and password.', 400);
        }

        // Find user — explicitly select password (it's excluded by default)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return errorResponse(res, 'Invalid email or password.', 401);
        }

        if (!user.isActive) {
            return errorResponse(res, 'Your account has been deactivated. Please contact admin.', 401);
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return errorResponse(res, 'Invalid email or password.', 401);
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id, user.role);

        return successResponse(
            res,
            {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    specialization: user.specialization,
                    profileImage: user.profileImage,
                    lastLogin: user.lastLogin,
                },
            },
            `Welcome back, ${user.name}!`
        );
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private (any authenticated user)
// @desc    Get the currently authenticated user's profile
// ─────────────────────────────────────────────────
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        return successResponse(res, user, 'User profile retrieved successfully');
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @access  Private (any authenticated user)
// @desc    Change password for the logged-in user
// ─────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return errorResponse(res, 'Please provide current and new password.', 400);
        }

        if (newPassword.length < 6) {
            return errorResponse(res, 'New password must be at least 6 characters.', 400);
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return errorResponse(res, 'Current password is incorrect.', 401);
        }

        user.password = newPassword;
        await user.save();

        return successResponse(res, null, 'Password updated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, changePassword };
