import { Request, Response } from 'express';
import authService from '../services/auth.service.js';
import logger from '../utils/logger.js';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: result,
      });
    } catch (error: any) {
      logger.error('Register error', { error: error.message });

      if (error.message === 'Email sudah terdaftar') {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login berhasil',
        data: result,
      });
    } catch (error: any) {
      logger.error('Login error', { error: error.message });

      if (error.message === 'Email atau password salah') {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token berhasil di-refresh',
        data: tokens,
      });
    } catch (error: any) {
      logger.error('Refresh token error', { error: error.message });

      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      logger.error('Get profile error', { error: error.message });

      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.id, req.body);

      res.json({
        success: true,
        message: 'Profil berhasil diupdate',
        data: user,
      });
    } catch (error: any) {
      logger.error('Update profile error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }
}

export default new AuthController();
