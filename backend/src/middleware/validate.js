const ApiError = require('../utils/ApiError');

/**
 * Creates a validation middleware using a Zod schema.
 * Validates the specified source (body, query, or params) and
 * replaces it with the parsed (coerced) data on success.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} source - Which part of the request to validate
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      return next(
        new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', details)
      );
    }

    // Replace with parsed (coerced) data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
