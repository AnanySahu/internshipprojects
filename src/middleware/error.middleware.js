const ApiError = require('../utils/apiError');

/**
 * 404 Not Found Middleware for unhandled route paths
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert raw Mongoose/JWT errors to standardized ApiError instances
  if (!(error instanceof ApiError)) {
    // 1. Mongoose bad ObjectId / CastError
    if (error.name === 'CastError') {
      const message = `Invalid ${error.path}: ${error.value}`;
      error = ApiError.badRequest(message);
    }
    // 2. Mongoose Duplicate Key (E11000)
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      const value = error.keyValue ? error.keyValue[field] : '';
      const message = `Duplicate value '${value}' entered for ${field}. Please use another value.`;
      error = ApiError.conflict(message);
    }
    // 3. Mongoose Validation Error
    else if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = ApiError.badRequest('Validation failed', validationErrors);
    }
    // 4. JWT invalid token
    else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid authentication token');
    }
    // 5. JWT expired token
    else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Authentication token has expired. Please log in again.');
    }
    // 6. Generic/fallback unhandled error
    else {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';
      error = new ApiError(statusCode, message);
    }
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Internal server error',
  };

  // Include detailed validation error list if present
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Log unexpected 500 server errors
  if (statusCode >= 500) {
    console.error('[Server Error]', err);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
