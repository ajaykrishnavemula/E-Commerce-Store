import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { logger } from '../utils/logger';

/**
 * Middleware to make authentication optional
 * If token is provided and valid, it sets req.user
 * If no token or invalid token, it continues without setting req.user
 */
const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Check for token in authorization header or cookie
  const authHeader = req.headers.authorization;
  const token = 
    (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]) ||
    req.cookies.token;
  
  if (!token) {
    // No token provided, continue as guest
    return next();
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Set user info on request object
    if (typeof decoded === 'object') {
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Invalid token, continue as guest
    logger.warn('Invalid token in optional auth middleware');
    next();
  }
};

export default optionalAuthMiddleware;

