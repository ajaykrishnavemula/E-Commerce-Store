import { Request, Response, NextFunction } from 'express';

/**
 * Async wrapper middleware to handle async errors
 * @param fn The async function to wrap
 * @returns A function that catches any errors and passes them to the next middleware
 */
const asyncWrapper = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default asyncWrapper;

