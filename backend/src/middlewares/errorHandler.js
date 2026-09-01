'use strict';

const { errorResponse } = require('../utils/response');

/**
 * Custom Operational Application Error
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {Array|null} [errors=null] - Array of validation errors [{ field, message }]
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Middleware for unhandled routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Global Error Handler Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle MySQL Specific Errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry conflict';
    // Extract duplicate key value if available
    const match = err.sqlMessage ? err.sqlMessage.match(/Duplicate entry '(.+)' for key '(.+)'/) : null;
    if (match) {
      errors = [{ field: match[2], message: `Value '${match[1]}' already exists` }];
    }
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Foreign key reference constraint failed';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    message = 'Cannot delete or update resource: it is referenced by other records';
  } else if (err.code === 'ER_DATA_TOO_LONG') {
    statusCode = 422;
    message = 'Data value too long for one or more fields';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  // Log error stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    console.error('💥 [GLOBAL ERROR]', err);
  }

  const responseBody = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      rawError: err.code || err.name,
    }),
  };

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
