const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Must be the last middleware registered
 */
function errorHandler(err, req, res, next) {
    logger.error('Unhandled error:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Prisma validation errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_ENTRY',
                message: `Duplicate entry for ${err.meta?.target?.join(', ')}`
            }
        });
    }

    // Prisma not found errors
    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Resource not found'
            }
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors)
            .map(e => e.message)
            .join('; ');

        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: messages
            }
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            }
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Request validation error handler
 */
function validationErrorHandler(errors) {
    if (errors.isEmpty()) {
        return null;
    }

    return {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }))
    };
}

/**
 * Async error wrapper for route handlers
 * Catches any errors thrown in async handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    validationErrorHandler,
    asyncHandler
};
