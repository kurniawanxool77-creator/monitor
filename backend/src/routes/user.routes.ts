import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

const router = Router();

// ==================== USER MANAGEMENT CRUD ====================

// Get all users (Admin only)
router.get('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        bidangKode: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        bidangKode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data user' });
  }
});

// Create user (Admin only)
router.post('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const { email, password, nama, role, bidangKode } = req.body;

    // Validation
    if (!email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, dan nama wajib diisi',
      });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid',
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter',
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        role: role || 'USER',
        bidangKode: bidangKode || null,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        bidangKode: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'CREATE_USER',
        details: `Membuat user baru: ${email} (${role || 'USER'})`,
      },
    });

    logger.info('User created', { id: user.id, email: user.email });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat user' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nama, role, aktif, bidangKode, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Prevent admin from deactivating themselves
    const currentUserId = (req as any).user.id;
    if (id === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengubah status akun sendiri',
      });
    }

    const updateData: any = {};

    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Format email tidak valid' });
      }
      const emailExists = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
      }
      updateData.email = email;
    }

    if (nama !== undefined) updateData.nama = nama;
    if (role !== undefined) updateData.role = role;
    if (aktif !== undefined) updateData.aktif = aktif;
    if (bidangKode !== undefined) updateData.bidangKode = bidangKode || null;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        bidangKode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'UPDATE_USER',
        details: `Mengubah user: ${existingUser.email}`,
      },
    });

    logger.info('User updated', { id: user.id, email: user.email });
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Prevent admin from deleting themselves
    const currentUserId = (req as any).user.id;
    if (id === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri',
      });
    }

    // Prevent deleting superadmin
    if (existingUser.role === 'SUPERADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Tidak dapat menghapus Super Admin',
      });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'DELETE_USER',
        details: `Menghapus user: ${existingUser.email}`,
      },
    });

    logger.info('User deleted', { id, email: existingUser.email });
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus user' });
  }
});

// Toggle user active status
router.patch('/:id/toggle', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const currentUserId = (req as any).user.id;
    if (id === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengubah status akun sendiri',
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { aktif: !existingUser.aktif },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        aktif: true,
        bidangKode: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUserId,
        action: existingUser.aktif ? 'DEACTIVATE_USER' : 'ACTIVATE_USER',
        details: `${existingUser.aktif ? 'Menonaktifkan' : 'Mengaktifkan'} user: ${existingUser.email}`,
      },
    });

    logger.info('User toggled', { id: user.id, aktif: user.aktif });
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error toggling user:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status user' });
  }
});

export default router;
