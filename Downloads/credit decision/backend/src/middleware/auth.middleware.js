const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authentication middleware - validates JWT token in Authorization header
 * Attaches decoded user info to req.user
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Access token required'
            }
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
        if (err) {
            logger.warn(`Invalid token attempted: ${err.message}`);
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Invalid or expired token'
                }
            });
        }
        req.user = user;
        next();
    });
}

/**
 * Optional authentication middleware - does not require token but validates if present
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
}

/**
 * Role-based authorization middleware
 * Usage: authorize(['ADMIN', 'CREDIT_OFFICER'])
 */
function authorize(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by user ${req.user.userId} with role ${req.user.role}`);
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions for this action'
                }
            });
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    optionalAuth,
    authorize
};
