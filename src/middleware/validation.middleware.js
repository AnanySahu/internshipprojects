const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Middleware to check express-validator validation results
 * Formats errors and forwards an ApiError to the global error handler
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break; // Optional early break if needed, or run all
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(ApiError.badRequest('Validation failed', formattedErrors));
  };
};

module.exports = validate;
