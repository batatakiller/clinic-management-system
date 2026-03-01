/**
 * Standardized API response helpers
 * Ensures consistent response shape across all endpoints:
 * { success: boolean, message: string, data: any, meta: any }
 */

/**
 * Send a success response
 * @param {Response} res - Express response object
 * @param {any} data - Response payload
 * @param {string} message - Human-readable success message
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {object} meta - Optional metadata (pagination, counts, etc.)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
    const response = {
        success: true,
        message,
        data,
    };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 * @param {any} errors - Optional validation errors array
 */
const errorResponse = (res, message = 'Something went wrong', statusCode = 400, errors = null) => {
    const response = {
        success: false,
        message,
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };
