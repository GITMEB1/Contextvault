const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const { APIError, asyncHandler } = require('./errorHandler');
const logger = require('../utils/logger');

const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from token (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        throw new APIError('User not found', 401, 'USER_NOT_FOUND');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new APIError('Account is disabled', 401, 'ACCOUNT_DISABLED');
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new APIError('Invalid token', 401, 'INVALID_TOKEN');
      } else if (error.name === 'TokenExpiredError') {
        throw new APIError('Token expired', 401, 'TOKEN_EXPIRED');
      } else {
        throw error;
      }
    }
  } else {
    throw new APIError('No token provided', 401, 'NO_TOKEN');
  }
});

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new APIError('Access denied. Not authenticated.', 401, 'NOT_AUTHENTICATED');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      throw new APIError(
        'Access denied. Insufficient permissions.',
        403,
        'INSUFFICIENT_PERMISSIONS',
        { requiredRoles: roles, userRole: req.user.role }
      );
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional auth failed', { error: error.message });
    }
  }

  next();
});

module.exports = {
  auth,
  authorize,
  optionalAuth
}; 