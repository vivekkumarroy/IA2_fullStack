/**
 * Custom API error class for consistent error handling.
 * Carries an HTTP status code and a machine-readable error code.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} code       - Machine-readable error code (e.g. 'VALIDATION_ERROR')
   * @param {string} message    - Human-readable message
   * @param {Array}  [details]  - Optional array of field-level details
   */
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
