/**
 * Wraps an async Express handler so thrown errors are forwarded to next().
 * Prevents unhandled promise rejections on every route handler.
 *
 * @param {Function} fn - async (req, res, next) => ...
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
