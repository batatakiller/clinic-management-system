/**
 * Global Error Handler Middleware
 * Must be registered LAST in Express (after all routes)
 * Usage: app.use(errorHandler)
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose Bad ObjectId (CastError)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: "${err.value}" is not a valid ID.`;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    // MongoDB Duplicate Key Error (unique constraint violation)
    if (err.code === 11000) {
        statusCode = 409;
        const duplicatedField = Object.keys(err.keyValue)[0];
        message = `An account with this ${duplicatedField} already exists.`;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired. Please log in again.';
    }

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${err.name}: ${err.message}`);
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only expose stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
