/**
 * Middleware Factory: checkRole(...roles)
 * Usage: checkRole('admin') or checkRole('admin', 'receptionist')
 *
 * Must be used AFTER verifyToken middleware — requires req.user to be populated.
 *
 * Examples:
 *   router.get('/doctors', verifyToken, checkRole('admin'), getAllDoctors)
 *   router.post('/patients', verifyToken, checkRole('admin', 'receptionist'), createPatient)
 */
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated. Please log in first.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This route requires one of these roles: [${roles.join(', ')}]. Your role: ${req.user.role}`,
            });
        }

        next();
    };
};

module.exports = { checkRole };
