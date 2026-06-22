import { Request, Response } from 'express';
import kegiatanService from '../services/kegiatan.service.js';
import logger from '../utils/logger.js';

export class KegiatanController {
  // ============ BIDANG ============
  async getAllBidang(_req: Request, res: Response): Promise<void> {
    try {
      const bidang = await kegiatanService.getAllBidang();

      res.json({
        success: true,
        data: bidang,
      });
    } catch (error: any) {
      logger.error('Get all bidang error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async getBidangById(req: Request, res: Response): Promise<void> {
    try {
      const bidang = await kegiatanService.getBidangById(req.params.id);

      res.json({
        success: true,
        data: bidang,
      });
    } catch (error: any) {
      logger.error('Get bidang by id error', { error: error.message });

      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createBidang(req: Request, res: Response): Promise<void> {
    try {
      const bidang = await kegiatanService.createBidang(req.body);

      res.status(201).json({
        success: true,
        message: 'Bidang berhasil dibuat',
        data: bidang,
      });
    } catch (error: any) {
      logger.error('Create bidang error', { error: error.message });

      if (error.message === 'Kode bidang sudah ada') {
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

  async updateBidang(req: Request, res: Response): Promise<void> {
    try {
      const bidang = await kegiatanService.updateBidang(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Bidang berhasil diupdate',
        data: bidang,
      });
    } catch (error: any) {
      logger.error('Update bidang error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async deleteBidang(req: Request, res: Response): Promise<void> {
    try {
      await kegiatanService.deleteBidang(req.params.id);

      res.json({
        success: true,
        message: 'Bidang berhasil dihapus',
      });
    } catch (error: any) {
      logger.error('Delete bidang error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  // ============ URAIAN ============
  async getAllUraian(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || undefined;
      const tree = req.query.tree === 'true';

      const data = tree
        ? await kegiatanService.getUraianTree(year)
        : await kegiatanService.getAllUraian(year);

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Get all uraian error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async createUraian(req: Request, res: Response): Promise<void> {
    try {
      const uraian = await kegiatanService.createUraian(req.body);

      res.status(201).json({
        success: true,
        message: 'Uraian berhasil dibuat',
        data: uraian,
      });
    } catch (error: any) {
      logger.error('Create uraian error', { error: error.message });

      if (error.message === 'Kode uraian sudah ada') {
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

  async updateUraian(req: Request, res: Response): Promise<void> {
    try {
      const uraian = await kegiatanService.updateUraian(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Uraian berhasil diupdate',
        data: uraian,
      });
    } catch (error: any) {
      logger.error('Update uraian error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async deleteUraian(req: Request, res: Response): Promise<void> {
    try {
      await kegiatanService.deleteUraian(req.params.id);

      res.json({
        success: true,
        message: 'Uraian berhasil dihapus',
      });
    } catch (error: any) {
      logger.error('Delete uraian error', { error: error.message });

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ============ SUB KEGIATAN ============
  async getAllSubKegiatan(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        bidangId: req.query.bidangId as string,
        status: req.query.status as string,
        tahun: req.query.tahun ? parseInt(req.query.tahun as string) : undefined,
        search: req.query.search as string,
      };

      const subKegiatan = await kegiatanService.getAllSubKegiatan(filters);

      res.json({
        success: true,
        data: subKegiatan,
      });
    } catch (error: any) {
      logger.error('Get all sub kegiatan error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async getSubKegiatanById(req: Request, res: Response): Promise<void> {
    try {
      const subKegiatan = await kegiatanService.getSubKegiatanById(req.params.id);

      res.json({
        success: true,
        data: subKegiatan,
      });
    } catch (error: any) {
      logger.error('Get sub kegiatan by id error', { error: error.message });

      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createSubKegiatan(req: Request, res: Response): Promise<void> {
    try {
      const subKegiatan = await kegiatanService.createSubKegiatan(req.body, req.user!.id);

      res.status(201).json({
        success: true,
        message: 'Sub kegiatan berhasil dibuat',
        data: subKegiatan,
      });
    } catch (error: any) {
      logger.error('Create sub kegiatan error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async updateSubKegiatan(req: Request, res: Response): Promise<void> {
    try {
      const subKegiatan = await kegiatanService.updateSubKegiatan(req.params.id, req.body, req.user!.id);

      res.json({
        success: true,
        message: 'Sub kegiatan berhasil diupdate',
        data: subKegiatan,
      });
    } catch (error: any) {
      logger.error('Update sub kegiatan error', { error: error.message });

      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateStep(req: Request, res: Response): Promise<void> {
    try {
      const step = await kegiatanService.updateStep(req.params.id, req.body, req.user!.id);

      res.json({
        success: true,
        message: 'Step berhasil diupdate',
        data: step,
      });
    } catch (error: any) {
      logger.error('Update step error', { error: error.message });

      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ============ REALISASI ============
  async createRealization(req: Request, res: Response): Promise<void> {
    try {
      const realization = await kegiatanService.createRealization(req.body, req.user!.id);

      res.status(201).json({
        success: true,
        message: 'Realisasi berhasil ditambahkan',
        data: realization,
      });
    } catch (error: any) {
      logger.error('Create realization error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async getRealizations(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        subKegiatanId: req.query.subKegiatanId as string,
        tahun: req.query.tahun ? parseInt(req.query.tahun as string) : undefined,
        bulan: req.query.bulan ? parseInt(req.query.bulan as string) : undefined,
      };

      const realizations = await kegiatanService.getRealizations(filters);

      res.json({
        success: true,
        data: realizations,
      });
    } catch (error: any) {
      logger.error('Get realizations error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  async getAnggaranSummary(req: Request, res: Response): Promise<void> {
    try {
      const tahun = parseInt(req.query.tahun as string) || new Date().getFullYear();
      const summary = await kegiatanService.getAnggaranSummary(tahun);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      logger.error('Get anggaran summary error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }

  // ============ ACTIVITY LOGS ============
  async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string,
        subKegiatanId: req.query.subKegiatanId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const logs = await kegiatanService.getActivityLogs(filters);

      res.json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      logger.error('Get activity logs error', { error: error.message });

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
      });
    }
  }
}

export default new KegiatanController();
