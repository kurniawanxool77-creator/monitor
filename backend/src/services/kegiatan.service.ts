import prisma from '../config/database.js';
import logger from '../utils/logger.js';

export class KegiatanService {
  // ============ BIDANG ============
  async getAllBidang() {
    return prisma.bidang.findMany({
      where: { aktif: true },
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: { subKegiatans: true, uraianList: true },
        },
      },
    });
  }

  async getBidangById(id: string) {
    const bidang = await prisma.bidang.findUnique({
      where: { id },
      include: {
        subKegiatans: {
          where: { status: { not: 'SELESAI' } },
          orderBy: { createdAt: 'desc' },
        },
        uraianList: {
          where: { level: 1 },
          orderBy: { kode: 'asc' },
        },
      },
    });

    if (!bidang) {
      throw new Error('Bidang tidak ditemukan');
    }

    return bidang;
  }

  async createBidang(data: { kode: string; nama: string; aktif?: boolean }) {
    const existing = await prisma.bidang.findUnique({ where: { kode: data.kode } });
    if (existing) {
      throw new Error('Kode bidang sudah ada');
    }

    const bidang = await prisma.bidang.create({ data });

    logger.info('Bidang created', { bidangId: bidang.id, kode: bidang.kode });

    return bidang;
  }

  async updateBidang(id: string, data: { kode?: string; nama?: string; aktif?: boolean }) {
    const bidang = await prisma.bidang.update({
      where: { id },
      data,
    });

    logger.info('Bidang updated', { bidangId: bidang.id });

    return bidang;
  }

  async deleteBidang(id: string) {
    await prisma.bidang.update({
      where: { id },
      data: { aktif: false },
    });

    logger.info('Bidang deactivated', { bidangId: id });
  }

  // ============ URAIAN ============
  async getAllUraian(activeYear?: number) {
    const year = activeYear || new Date().getFullYear();

    return prisma.uraian.findMany({
      where: { activeYear: year },
      orderBy: [{ level: 'asc' }, { kode: 'asc' }],
      include: {
        bidang: { select: { id: true, nama: true, kode: true } },
        _count: { select: { children: true } },
      },
    });
  }

  async getUraianTree(activeYear?: number) {
    const year = activeYear || new Date().getFullYear();
    const allUraian = await this.getAllUraian(year);

    const buildTree = (parentId: string | null): any[] => {
      return allUraian
        .filter((u) => u.parentId === parentId)
        .map((uraian) => ({
          ...uraian,
          children: buildTree(uraian.id),
        }));
    };

    return buildTree(null);
  }

  async createUraian(data: {
    kode: string;
    nama: string;
    level: number;
    parentId?: string | null;
    bidangId?: string | null;
    pagu?: number;
    activeYear?: number;
  }) {
    const existing = await prisma.uraian.findFirst({
      where: { kode: data.kode, activeYear: data.activeYear || new Date().getFullYear() },
    });

    if (existing) {
      throw new Error('Kode uraian sudah ada');
    }

    const uraian = await prisma.uraian.create({ data });

    logger.info('Uraian created', { uraianId: uraian.id, kode: uraian.kode });

    return uraian;
  }

  async updateUraian(id: string, data: { kode?: string; nama?: string; pagu?: number }) {
    const uraian = await prisma.uraian.update({
      where: { id },
      data,
    });

    logger.info('Uraian updated', { uraianId: uraian.id });

    return uraian;
  }

  async deleteUraian(id: string) {
    // Check if has children
    const children = await prisma.uraian.findMany({ where: { parentId: id } });

    if (children.length > 0) {
      throw new Error('Tidak dapat menghapus uraian yang memiliki anak');
    }

    await prisma.uraian.delete({ where: { id } });

    logger.info('Uraian deleted', { uraianId: id });
  }

  // ============ SUB KEGIATAN ============
  async getAllSubKegiatan(filters?: {
    bidangId?: string;
    status?: string;
    tahun?: number;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.bidangId) {
      where.bidangId = filters.bidangId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.tahun) {
      where.tanggalMulai = {
        gte: new Date(`${filters.tahun}-01-01`),
        lte: new Date(`${filters.tahun}-12-31`),
      };
    }

    if (filters?.search) {
      where.nama = { contains: filters.search, mode: 'insensitive' };
    }

    return prisma.subKegiatan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        bidang: { select: { id: true, nama: true, kode: true } },
        uraian: { select: { id: true, nama: true, kode: true } },
        steps: { orderBy: { urutan: 'asc' } },
        _count: { select: { realizations: true, verifications: true } },
      },
    });
  }

  async getSubKegiatanById(id: string) {
    const subKegiatan = await prisma.subKegiatan.findUnique({
      where: { id },
      include: {
        bidang: true,
        uraian: true,
        steps: { orderBy: { urutan: 'asc' } },
        realizations: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, nama: true } } },
        },
        verifications: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, nama: true } } },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { id: true, nama: true } } },
        },
      },
    });

    if (!subKegiatan) {
      throw new Error('Sub kegiatan tidak ditemukan');
    }

    return subKegiatan;
  }

  async createSubKegiatan(
    data: {
      uraianId: string;
      bidangId: string;
      nama: string;
      penanggungJawab: string;
      sumberDana?: string;
      anggaranSubKegiatan?: number;
      tanggalMulai: Date;
      tanggalSelesai: Date;
      isWadah?: boolean;
    },
    userId: string
  ) {
    // Create sub kegiatan
    const subKegiatan = await prisma.subKegiatan.create({
      data: {
        ...data,
        status: 'PERSIAPAN',
      },
      include: {
        bidang: true,
        uraian: true,
      },
    });

    // Create default steps
    const defaultSteps = [
      { nama: 'Persiapan Dokumen', deskripsi: 'Siapkan seluruh dokumen pendukung', urutan: 1 },
      { nama: 'Koordinasi Internal', deskripsi: 'Koordinasi dengan pihak terkait', urutan: 2 },
      { nama: 'Pelaksanaan', deskripsi: 'Execute the activity', urutan: 3 },
      { nama: 'Evaluasi', deskripsi: 'Evaluasi hasil kegiatan', urutan: 4 },
      { nama: 'Verifikasi', deskripsi: 'Verifikasi kelengkapan dokumen', urutan: 5 },
    ];

    await prisma.step.createMany({
      data: defaultSteps.map((step) => ({
        ...step,
        subKegiatanId: subKegiatan.id,
      })),
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        subKegiatanId: subKegiatan.id,
        action: 'CREATE_SUB_KEGIATAN',
        details: `Membuat sub kegiatan: ${subKegiatan.nama}`,
      },
    });

    logger.info('Sub kegiatan created', {
      subKegiatanId: subKegiatan.id,
      nama: subKegiatan.nama,
    });

    return this.getSubKegiatanById(subKegiatan.id);
  }

  async updateSubKegiatan(id: string, data: any, userId: string) {
    const existing = await prisma.subKegiatan.findUnique({ where: { id } });

    if (!existing) {
      throw new Error('Sub kegiatan tidak ditemukan');
    }

    const subKegiatan = await prisma.subKegiatan.update({
      where: { id },
      data,
      include: {
        bidang: true,
        uraian: true,
        steps: { orderBy: { urutan: 'asc' } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        subKegiatanId: id,
        action: 'UPDATE_SUB_KEGIATAN',
        details: `Mengupdate sub kegiatan: ${subKegiatan.nama}`,
      },
    });

    logger.info('Sub kegiatan updated', { subKegiatanId: id });

    return subKegiatan;
  }

  async updateStep(stepId: string, data: { completed?: boolean; catatan?: string }, userId: string) {
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: { subKegiatan: true },
    });

    if (!step) {
      throw new Error('Step tidak ditemukan');
    }

    const updateData: any = { ...data };
    if (data.completed !== undefined) {
      updateData.completedAt = data.completed ? new Date() : null;
    }

    const updatedStep = await prisma.step.update({
      where: { id: stepId },
      data: updateData,
    });

    // Update sub kegiatan status if all steps completed
    if (data.completed) {
      const allSteps = await prisma.step.findMany({
        where: { subKegiatanId: step.subKegiatanId },
      });

      const allCompleted = allSteps.every((s) => s.completed || s.id === stepId);

      if (allCompleted) {
        await prisma.subKegiatan.update({
          where: { id: step.subKegiatanId },
          data: { status: 'SELESAI' },
        });
      } else {
        // Auto advance to next incomplete step's status
        const nextStep = allSteps.find((s) => !s.completed && s.urutan > step.urutan);
        if (nextStep) {
          const statusMap: Record<number, string> = {
            1: 'PERSIAPAN',
            2: 'KOORDINASI',
            3: 'PELAKSANAAN',
            4: 'EVALUASI',
            5: 'VERIFIKASI',
          };
          await prisma.subKegiatan.update({
            where: { id: step.subKegiatanId },
            data: { status: statusMap[nextStep.urutan] || 'PELAKSANAAN' },
          });
        }
      }
    }

    await prisma.activityLog.create({
      data: {
        userId,
        subKegiatanId: step.subKegiatanId,
        action: data.completed ? 'COMPLETE_STEP' : 'UPDATE_STEP',
        details: `${data.completed ? 'Menyelesaikan' : 'Mengupdate'} step: ${step.nama}`,
      },
    });

    return updatedStep;
  }

  // ============ REALISASI ============
  async createRealization(
    data: { subKegiatanId: string; jumlah: number; keterangan?: string; bulan: number; tahun: number },
    userId: string
  ) {
    const realization = await prisma.realization.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: { select: { id: true, nama: true } },
        subKegiatan: { select: { id: true, nama: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        subKegiatanId: data.subKegiatanId,
        action: 'CREATE_REALIZATION',
        details: `Menambahkan realized: Rp ${data.jumlah.toLocaleString('id-ID')}`,
      },
    });

    logger.info('Realization created', { realizationId: realization.id });

    return realization;
  }

  async getRealizations(filters?: { subKegiatanId?: string; tahun?: number; bulan?: number }) {
    const where: any = {};

    if (filters?.subKegiatanId) {
      where.subKegiatanId = filters.subKegiatanId;
    }

    if (filters?.tahun) {
      where.tahun = filters.tahun;
    }

    if (filters?.bulan) {
      where.bulan = filters.bulan;
    }

    return prisma.realization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nama: true } },
        subKegiatan: {
          select: { id: true, nama: true, bidang: { select: { nama: true } } },
        },
      },
    });
  }

  // ============ ANGGARAN SUMMARY ============
  async getAnggaranSummary(tahun: number) {
    const bidangList = await prisma.bidang.findMany({
      where: { aktif: true },
      include: {
        subKegiatans: {
          where: {
            tanggalMulai: {
              gte: new Date(`${tahun}-01-01`),
              lte: new Date(`${tahun}-12-31`),
            },
          },
          include: {
            realizations: {
              where: { tahun },
            },
          },
        },
      },
    });

    return bidangList.map((bidang) => {
      const totalPagu = bidang.subKegiatans.reduce((sum, sk) => sum + sk.anggaranSubKegiatan, 0);
      const totalRealisasi = bidang.subKegiatans.reduce(
        (sum, sk) => sum + sk.realizations.reduce((s, r) => s + r.jumlah, 0),
        0
      );

      return {
        bidang: { id: bidang.id, nama: bidang.nama, kode: bidang.kode },
        totalPagu,
        totalRealisasi,
        sisaDana: totalPagu - totalRealisasi,
        prosentase: totalPagu > 0 ? Math.round((totalRealisasi / totalPagu) * 100) : 0,
      };
    });
  }

  // ============ ACTIVITY LOGS ============
  async getActivityLogs(filters?: { userId?: string; subKegiatanId?: string; limit?: number }) {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.subKegiatanId) {
      where.subKegiatanId = filters.subKegiatanId;
    }

    return prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
      include: {
        user: { select: { id: true, nama: true, email: true } },
        subKegiatan: { select: { id: true, nama: true } },
      },
    });
  }
}

export default new KegiatanService();
