import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Optional: verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id, aktif: true },
      select: { id: true, email: true, role: true, nama: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User tidak valid atau tidak aktif',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(401).json({
      success: false,
      message: 'Token tidak valid atau expired',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Belum terautentikasi',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses',
      });
      return;
    }

    next();
  };
};
