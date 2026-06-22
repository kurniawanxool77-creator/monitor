import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: unknown;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  } as ApiResponse);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan`,
  } as ApiResponse);
};
