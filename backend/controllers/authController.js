const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { generateToken } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new user (default role: patient)
// ─────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Prevent public registration of admin/doctor — those must be created by admin
        const allowedPublicRoles = ['patient', 'receptionist'];
        const assignedRole = role && allowedPublicRoles.includes(role) ? role : 'patient';

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 'Uma conta com este e-mail já existe.', 409);
        }

        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
            phone,
        });

        // If user is a patient, create an empty patient profile
        if (assignedRole === 'patient') {
            await PatientProfile.create({
                userId: user._id,
            });
        }

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
            'Conta criada com sucesso',
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
        console.log('Login request received with:', { email, password });

        if (!email || !password) {
            return errorResponse(res, 'Por favor, forneça o e-mail e a senha.', 400);
        }

        // Find user — explicitly select password (it's excluded by default)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return errorResponse(res, 'E-mail ou senha inválidos.', 401);
        }

        if (!user.isActive) {
            return errorResponse(res, 'Sua conta foi desativada. Por favor, contate o administrador.', 401);
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return errorResponse(res, 'E-mail ou senha inválidos.', 401);
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
            `Bem-vindo(a) de volta, ${user.name}!`
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
        return successResponse(res, user, 'Perfil do usuário recuperado com sucesso');
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
            return errorResponse(res, 'Por favor, forneça a senha atual e a nova senha.', 400);
        }

        if (newPassword.length < 6) {
            return errorResponse(res, 'A nova senha deve ter pelo menos 6 caracteres.', 400);
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return errorResponse(res, 'A senha atual está incorreta.', 401);
        }

        user.password = newPassword;
        await user.save();

        return successResponse(res, null, 'Senha atualizada com sucesso');
    } catch (error) {
        next(error);
    }
};

const cloudinary = require('../config/cloudinary');

// @route   PUT /api/auth/profile
// @access  Private
// @desc    Update currently logged in user's basic profile
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return errorResponse(res, 'Usuário não encontrado.', 404);
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        // Handle profile image upload if provided
        if (req.file) {
            try {
                // Upload to Cloudinary using buffer
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'healthcare/profiles',
                            public_id: `profile_${user._id}`,
                            overwrite: true,
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(req.file.buffer);
                });

                user.profileImage = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                // Continue without updating image if upload fails
            }
        }

        await user.save();

        return successResponse(
            res,
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileImage: user.profileImage,
            },
            'Perfil atualizado com sucesso'
        );
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, changePassword, updateProfile };
