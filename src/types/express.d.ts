import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name?: string;
        email?: string;
        role?: string;
        isEmailVerified?: boolean;
        iat?: number;
        exp?: number;
      } | JwtPayload;
      cookies: {
        [key: string]: string;
      };
    }
  }
}

export {};

