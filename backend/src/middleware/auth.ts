import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthenticatedError, ForbiddenError } from '../errors';
import config from '../config';

// Note: Request interface is already extended in src/types/express.d.ts

/**
 * Authentication middleware to verify JWT token
 */
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // Check for token in headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const payload = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      name: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
    };

    // Attach user to request object
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

/**
 * Authorization middleware to check user roles
 * @param allowedRoles Array of roles allowed to access the route
 */
const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthenticatedError('Authentication invalid');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Not authorized to access this route');
    }

    next();
  };
};

/**
 * Middleware to check if email is verified
 */
const requireEmailVerification = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  if (!req.user.isEmailVerified) {
    throw new ForbiddenError('Please verify your email address first');
  }

  next();
};

export {
  authenticateUser,
  authorizeRoles,
  requireEmailVerification,
};

export default authenticateUser;

