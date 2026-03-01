const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────
// @route   POST /api/appointments
// @access  Admin, Receptionist, Patient
// @desc    Book a new appointment
// ─────────────────────────────────────────────────
const bookAppointment = async (req, res, next) => {
    try {
        const { patientId, doctorId, date, timeSlot, reason, notes } = req.body;

        if (!patientId || !doctorId || !date || !timeSlot || !reason) {
            return errorResponse(res, 'patientId, doctorId, date, timeSlot, and reason are required.', 400);
        }

        // Verify patient exists
        const patient = await User.findOne({ _id: patientId, role: 'patient' });
        if (!patient) return errorResponse(res, 'Patient not found.', 404);

        // Verify doctor exists
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
        if (!doctor) return errorResponse(res, 'Doctor not found or inactive.', 404);

        // Check for duplicate slot
        const existingSlot = await Appointment.findOne({
            doctorId,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] },
        });
        if (existingSlot) {
            return errorResponse(res, 'This time slot is already booked for the selected doctor.', 409);
        }

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            bookedBy: req.user._id,
            date: new Date(date),
            timeSlot,
            reason,
            notes,
        });

        const populated = await appointment.populate([
            { path: 'patientId', select: 'name email phone' },
            { path: 'doctorId', select: 'name specialization phone' },
            { path: 'bookedBy', select: 'name role' },
        ]);

        return successResponse(res, populated, 'Appointment booked successfully', 201);
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   GET /api/appointments
// @access  All authenticated roles (role-filtered)
// ─────────────────────────────────────────────────
const getAppointments = async (req, res, next) => {
    try {
        const { status, date, page = 1, limit = 20 } = req.query;
        const filter = {};

        // Role-based filtering
        if (req.user.role === 'patient') {
            filter.patientId = req.user._id;
        } else if (req.user.role === 'doctor') {
            filter.doctorId = req.user._id;
        }
        // Admin and Receptionist see all

        if (status) filter.status = status;
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            filter.date = { $gte: start, $lt: end };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [appointments, total] = await Promise.all([
            Appointment.find(filter)
                .populate('patientId', 'name email phone')
                .populate('doctorId', 'name specialization phone')
                .populate('bookedBy', 'name role')
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Appointment.countDocuments(filter),
        ]);

        return successResponse(res, appointments, 'Appointments retrieved successfully', 200, {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   GET /api/appointments/:id
// @access  All authenticated roles
// ─────────────────────────────────────────────────
const getAppointmentById = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization phone email')
            .populate('bookedBy', 'name role');

        if (!appointment) return errorResponse(res, 'Appointment not found.', 404);

        // Patients can only view their own appointments
        if (
            req.user.role === 'patient' &&
            appointment.patientId._id.toString() !== req.user._id.toString()
        ) {
            return errorResponse(res, 'You are not authorized to view this appointment.', 403);
        }

        return successResponse(res, appointment, 'Appointment retrieved');
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   PUT /api/appointments/:id/status
// @access  Doctor, Admin
// @desc    Update appointment status
// ─────────────────────────────────────────────────
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status, notes, followUpDate } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

        if (!status || !validStatuses.includes(status)) {
            return errorResponse(res, `Status must be one of: ${validStatuses.join(', ')}`, 400);
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return errorResponse(res, 'Appointment not found.', 404);

        // Doctors can only update their own appointments
        if (req.user.role === 'doctor' && appointment.doctorId.toString() !== req.user._id.toString()) {
            return errorResponse(res, 'You can only update your own appointments.', 403);
        }

        appointment.status = status;
        if (notes) appointment.notes = notes;
        if (followUpDate) appointment.followUpDate = followUpDate;
        await appointment.save();

        const populated = await appointment.populate([
            { path: 'patientId', select: 'name email phone' },
            { path: 'doctorId', select: 'name specialization' },
        ]);

        return successResponse(res, populated, `Appointment status updated to "${status}"`);
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────
// @route   PUT /api/appointments/:id/cancel
// @access  Admin, Receptionist, Patient (own only)
// ─────────────────────────────────────────────────
const cancelAppointment = async (req, res, next) => {
    try {
        const { cancelReason } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) return errorResponse(res, 'Appointment not found.', 404);

        if (['completed', 'cancelled'].includes(appointment.status)) {
            return errorResponse(res, `Cannot cancel an appointment that is already "${appointment.status}".`, 400);
        }

        // Patients can only cancel their own
        if (
            req.user.role === 'patient' &&
            appointment.patientId.toString() !== req.user._id.toString()
        ) {
            return errorResponse(res, 'You can only cancel your own appointments.', 403);
        }

        appointment.status = 'cancelled';
        if (cancelReason) appointment.cancelReason = cancelReason;
        await appointment.save();

        return successResponse(res, appointment, 'Appointment cancelled successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    bookAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelAppointment,
};
