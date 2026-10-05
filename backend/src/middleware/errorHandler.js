const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');
const { NODE_ENV } = require('../config/env');

/**
 * Centralized error handler.
 * Handles: ApiError, ZodError, Mongoose ValidationError, CastError,
 * duplicate key (11000), JWT errors, and falls back to 500.
 * Never leaks internals in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || undefined;

  // ── ApiError (our custom errors) ──
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }

  // ── ZodError ──
  else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // ── Mongoose ValidationError ──
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose CastError (invalid ObjectId etc.) ──
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid value for ${err.path}: ${err.value}`;
  }

  // ── MongoDB duplicate key error ──
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. This ${field} already exists.`;
  }

  // ── JWT errors ──
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHENTICATED';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHENTICATED';
    message = 'Authentication token has expired';
  }

  // ── Fallback to 500 ──
  else {
    statusCode = 500;
    code = 'INTERNAL_ERROR';
    message = NODE_ENV === 'development' ? err.message : 'An unexpected error occurred';
  }

  // Log the error (full stack in dev)
  if (statusCode >= 500) {
    console.error(`[${req.id || 'no-id'}] ERROR:`, err);
  }

  const response = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
