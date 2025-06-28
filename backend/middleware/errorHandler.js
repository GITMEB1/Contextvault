const logger = require('../utils/logger');
const config = require('../config/config');

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// MongoDB error handler
const handleMongoDBError = (error) => {
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyValue)[0];
    return new APIError(
      `${field} already exists`,
      400,
      'DUPLICATE_ENTRY',
      { field, value: error.keyValue[field] }
    );
  }
  
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    
    return new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors }
    );
  }
  
  if (error.name === 'CastError') {
    // Invalid ObjectId
    return new APIError(
      'Invalid ID format',
      400,
      'INVALID_ID',
      { field: error.path, value: error.value }
    );
  }
  
  return new APIError('Database error', 500, 'DATABASE_ERROR');
};

// JWT error handler
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new APIError('Invalid token', 401, 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new APIError('Token expired', 401, 'TOKEN_EXPIRED');
  }
  
  return new APIError('Authentication error', 401, 'AUTH_ERROR');
};

// Validation error handler
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context.value
    }));
    
    return new APIError(
      'Input validation failed',
      400,
      'VALIDATION_ERROR',
      { errors }
    );
  }
  
  return error;
};

// Rate limit error handler
const handleRateLimitError = (error) => {
  return new APIError(
    'Too many requests, please try again later',
    429,
    'RATE_LIMIT_EXCEEDED',
    { 
      retryAfter: error.msBeforeNext,
      limit: error.limit,
      current: error.current
    }
  );
};

// Main error handler middleware
const errorHandler = (error, req, res, next) => {
  let handledError = error;
  
  // Handle specific error types
  if (error.code === 11000 || error.name === 'ValidationError' || error.name === 'CastError') {
    handledError = handleMongoDBError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    handledError = handleJWTError(error);
  } else if (error.name === 'ValidationError' && error.details) {
    handledError = handleValidationError(error);
  } else if (error.name === 'RateLimitError') {
    handledError = handleRateLimitError(error);
  } else if (!error.isOperational) {
    // Unknown error - wrap it
    handledError = new APIError(
      config.nodeEnv === 'production' ? 'Something went wrong' : error.message,
      500,
      'INTERNAL_ERROR'
    );
  }
  
  // Log the error
  logger.logError(handledError, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    requestId: req.id,
  });
  
  // Prepare error response
  const errorResponse = {
    error: {
      message: handledError.message,
      code: handledError.code,
      statusCode: handledError.statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    }
  };
  
  // Add details in development mode or if explicitly provided
  if (config.nodeEnv === 'development' || handledError.details) {
    errorResponse.error.details = handledError.details;
  }
  
  // Add stack trace in development mode
  if (config.nodeEnv === 'development') {
    errorResponse.error.stack = handledError.stack;
  }
  
  // Add request ID if available
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }
  
  // Send error response
  res.status(handledError.statusCode || 500).json(errorResponse);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND',
    { path: req.originalUrl, method: req.method }
  );
  
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  APIError
}; 