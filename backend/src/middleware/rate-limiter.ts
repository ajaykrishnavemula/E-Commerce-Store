import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

/**
 * Rate limiter middleware to prevent brute force attacks
 * Limits the number of requests from the same IP address
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimiter.windowMs, // Time window
  max: config.rateLimiter.max, // Limit each IP to max requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Too many requests',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: false, // Count successful requests against the rate limit
  skipFailedRequests: false, // Count failed requests against the rate limit
});

/**
 * Stricter rate limiter for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'Too many requests',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

/**
 * Rate limiter for checkout routes
 */
const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 checkout attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many checkout attempts, please try again later.',
    error: 'Too many requests',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

export { rateLimiter, authLimiter, checkoutLimiter };
export default rateLimiter;

