import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger';
import CustomAPIError from '../errors/custom-error';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, any>;
}

const errorHandlerMiddleware = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack || 'No stack trace available');

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, please try again later',
  };

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors || {})
      .map((item: any) => item.message)
      .join(', ');
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    customError.message = `Duplicate value entered for ${field} field. Please choose another value.`;
    customError.statusCode = StatusCodes.CONFLICT;
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    customError.message = `No item found with id: ${(err as any).value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    customError.message = 'Invalid token. Please log in again.';
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  // Handle JWT expiration
  if (err.name === 'TokenExpiredError') {
    customError.message = 'Your token has expired. Please log in again.';
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  // Handle Stripe errors
  if (err.name === 'StripeError') {
    customError.message = 'Payment processing error. Please try again.';
    customError.statusCode = StatusCodes.PAYMENT_REQUIRED;
  }

  return res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.name,
      stack: err.stack,
    }),
  });
};

export default errorHandlerMiddleware;

