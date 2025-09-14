import { Request, Response, NextFunction } from 'express';

// ✅ FIXED: Custom error interface with status property
interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  isOperational?: boolean;
}

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as CustomError;
  error.status = 404;
  next(error);
};

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
