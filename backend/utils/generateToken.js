const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} id - MongoDB user _id
 * @param {string} role - User role (admin/doctor/receptionist/patient)
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

module.exports = { generateToken };
