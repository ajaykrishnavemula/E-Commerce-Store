import { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '../errors';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to check if user has admin role
 * Must be used after authMiddleware
 */
const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'admin') {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
  
  next();
};

export default adminMiddleware;

