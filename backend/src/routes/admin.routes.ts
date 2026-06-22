import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

const router = Router();
const requireAdmin = authorize('ADMIN', 'SUPERADMIN');

// ============ USER MANAGEMENT ============

// GET all users (admin only)
router.get('/users', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create user
router.post('/users', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nama, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nama, role: role || 'USER' },
      select: { id: true, email: true, nama: true, role: true, aktif: true, createdAt: true },
    });
    logger.info('User created', { userId: user.id });
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// PATCH update user
router.patch('/users/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, role, aktif, password } = req.body;
    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama;
    if (role !== undefined) updateData.role = role;
    if (aktif !== undefined) updateData.aktif = aktif;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, email: true, nama: true, role: true, aktif: true },
    });
    logger.info('User updated', { userId: user.id });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE user
router.delete('/users/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { aktif: false },
    });
    logger.info('User deactivated', { userId: req.params.id });
    res.json({ success: true, message: 'User dinonaktifkan' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ SUMBER DANA ============

// GET all sumber dana
router.get('/sumber-dana', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await prisma.sumberDana.findMany({
      where: { aktif: true },
      orderBy: { nama: 'asc' },
    });
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create sumber dana
router.post('/sumber-dana', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await prisma.sumberDana.create({
      data: { nama: req.body.nama },
    });
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Sumber dana sudah ada' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// DELETE sumber dana
router.delete('/sumber-dana/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.sumberDana.update({
      where: { id: req.params.id },
      data: { aktif: false },
    });
    res.json({ success: true, message: 'Sumber dana dihapus' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
