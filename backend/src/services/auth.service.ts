import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/env.js';
import { JwtPayload } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import logger from '../utils/logger.js';

interface LoginResult {
  user: {
    id: string;
    email: string;
    nama: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    nama: string;
    role?: string;
  }): Promise<{ user: any; tokens: { accessToken: string; refreshToken: string } }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nama: data.nama,
        role: (data.role as any) || 'USER',
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.logActivity(user.id, 'REGISTER', `User ${user.email} registered`);

    logger.info('User registered', { userId: user.id, email: user.email });

    return { user, tokens };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { email, aktif: true },
    });

    if (!user) {
      throw new Error('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email atau password salah');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.logActivity(user.id, 'LOGIN', `User ${user.email} logged in`);

    logger.info('User logged in', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id, aktif: true },
      });

      if (!user) {
        throw new Error('User tidak valid');
      }

      return await this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new Error('Refresh token tidak valid atau expired');
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    return user;
  }

  async updateProfile(userId: string, data: { nama?: string; password?: string }) {
    const updateData: any = {};

    if (data.nama) {
      updateData.nama = data.nama;
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        updatedAt: true,
      },
    });

    await this.logActivity(userId, 'UPDATE_PROFILE', 'User updated their profile');

    return user;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { id: userId, email, role };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  private async logActivity(userId: string, action: string, details?: string, subKegiatanId?: string) {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        subKegiatanId,
      },
    });
  }
}

export default new AuthService();
