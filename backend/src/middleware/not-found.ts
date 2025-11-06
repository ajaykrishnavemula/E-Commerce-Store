import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const notFoundMiddleware = (req: Request, res: Response) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFoundMiddleware;

