import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack); // Log full error details in the console

  const statusCode = err.status || 500; // Default to 500 if status code isn't set
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
}