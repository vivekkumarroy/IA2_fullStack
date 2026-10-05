const morgan = require('morgan');
const crypto = require('crypto');
const { NODE_ENV } = require('../config/env');

/**
 * Request logger middleware:
 * - Generates a unique x-request-id for each request
 * - Attaches it to req.id and the response header
 * - Uses morgan for formatted logging
 * - Skips logging in test environment
 */
const requestLogger = (req, res, next) => {
  // Generate and attach request ID
  const requestId = crypto.randomUUID();
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

// Morgan format with request ID
const morganMiddleware = morgan(
  ':method :url :status :response-time ms',
  {
    skip: () => NODE_ENV === 'test',
  }
);

module.exports = { requestLogger, morganMiddleware };
