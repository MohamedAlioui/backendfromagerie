import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_CONFIG } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    ...RATE_LIMIT_CONFIG,
    ...options,
    handler: (req, res, next) => {
      throw new ApiError(429, RATE_LIMIT_CONFIG.message);
    }
  });
};

// Specific limiters for different routes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message: 'Too many login attempts, please try again later'
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000 // 1000 requests per hour
});