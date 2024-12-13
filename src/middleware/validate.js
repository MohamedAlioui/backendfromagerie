import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    throw new ApiError(400, 'Validation failed', formattedErrors);
  };
};

export const sanitizeRequest = (req, res, next) => {
  // Remove any potential XSS content
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key]
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
    }
  });
  next();
};