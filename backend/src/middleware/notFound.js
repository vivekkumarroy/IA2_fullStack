const ApiError = require('../utils/ApiError');

/**
 * 404 handler for unmatched routes.
 */
const notFound = (req, _res, next) => {
  next(new ApiError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
};

module.exports = notFound;
