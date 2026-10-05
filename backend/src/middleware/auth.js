const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET } = require('../config/env');

/**
 * JWT authentication middleware.
 * Reads `Authorization: Bearer <token>`, verifies, and attaches
 * `req.user = { sub, email, role }`.
 */
const protect = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new ApiError(401, 'UNAUTHENTICATED', 'Authentication token is missing')
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new ApiError(401, 'UNAUTHENTICATED', 'Authentication token has expired')
      );
    }
    return next(
      new ApiError(401, 'UNAUTHENTICATED', 'Invalid authentication token')
    );
  }
};

module.exports = protect;
