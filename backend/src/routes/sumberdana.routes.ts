import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

const router = Router();

// ==================== SUMBER DANA CRUD ====================

// Get all SumberDana
router.get('/', authenticate, async (req, res) => {
  try {
    const sumberDana = await prisma.sumberDana.findMany({
      orderBy: { nama: 'asc' },
    });
    res.json({ success: true, data: sumberDana });
  } catch (error) {
    logger.error('Error fetching sumber dana:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data sumber dana' });
  }
});

// Create SumberDana
router.post('/', authenticate, async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama || typeof nama !== 'string' || nama.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama sumber dana wajib diisi' });
    }

    const existing = await prisma.sumberDana.findUnique({
      where: { nama: nama.trim() },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Sumber dana sudah ada' });
    }

    const sumberDana = await prisma.sumberDana.create({
      data: { nama: nama.trim() },
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'CREATE_SUMBER_DANA',
        details: `Membuat sumber dana: ${nama}`,
      },
    });

    logger.info('SumberDana created', { id: sumberDana.id, nama: sumberDana.nama });
    res.status(201).json({ success: true, data: sumberDana });
  } catch (error) {
    logger.error('Error creating sumber dana:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat sumber dana' });
  }
});

// Update SumberDana
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, aktif } = req.body;

    const existing = await prisma.sumberDana.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sumber dana tidak ditemukan' });
    }

    if (nama) {
      const duplicate = await prisma.sumberDana.findFirst({
        where: { nama: nama.trim(), NOT: { id } },
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Nama sumber dana sudah digunakan' });
      }
    }

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama.trim();
    if (aktif !== undefined) updateData.aktif = aktif;

    const sumberDana = await prisma.sumberDana.update({
      where: { id },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'UPDATE_SUMBER_DANA',
        details: `Mengubah sumber dana: ${existing.nama} -> ${sumberDana.nama}`,
      },
    });

    logger.info('SumberDana updated', { id: sumberDana.id, nama: sumberDana.nama });
    res.json({ success: true, data: sumberDana });
  } catch (error) {
    logger.error('Error updating sumber dana:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah sumber dana' });
  }
});

// Delete SumberDana
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.sumberDana.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sumber dana tidak ditemukan' });
    }

    // Check if used by any SubKegiatan
    const usedCount = await prisma.subKegiatan.count({
      where: { sumberDana: existing.nama },
    });

    if (usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Sumber dana digunakan oleh ${usedCount} sub kegiatan. Tidak dapat dihapus.`,
      });
    }

    await prisma.sumberDana.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.id,
        action: 'DELETE_SUMBER_DANA',
        details: `Menghapus sumber dana: ${existing.nama}`,
      },
    });

    logger.info('SumberDana deleted', { id, nama: existing.nama });
    res.json({ success: true, message: 'Sumber dana berhasil dihapus' });
  } catch (error) {
    logger.error('Error deleting sumber dana:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus sumber dana' });
  }
});

export default router;
