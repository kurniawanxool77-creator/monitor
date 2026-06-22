import Joi from 'joi';

export const createBidangSchema = Joi.object({
  kode: Joi.string().max(20).required(),
  nama: Joi.string().max(100).required(),
  aktif: Joi.boolean().default(true),
});

export const updateBidangSchema = Joi.object({
  kode: Joi.string().max(20),
  nama: Joi.string().max(100),
  aktif: Joi.boolean(),
});

export const createUraianSchema = Joi.object({
  kode: Joi.string().required(),
  nama: Joi.string().required(),
  level: Joi.number().min(1).max(4).required(),
  parentId: Joi.string().uuid().allow(null),
  bidangId: Joi.string().uuid().allow(null),
  pagu: Joi.number().min(0).default(0),
  activeYear: Joi.number().min(2020).max(2100).default(() => new Date().getFullYear()),
});

export const updateUraianSchema = Joi.object({
  kode: Joi.string(),
  nama: Joi.string(),
  level: Joi.number().min(1).max(4),
  parentId: Joi.string().uuid().allow(null),
  pagu: Joi.number().min(0),
});

export const createSubKegiatanSchema = Joi.object({
  uraianId: Joi.string().uuid().required(),
  bidangId: Joi.string().uuid().required(),
  nama: Joi.string().required(),
  penanggungJawab: Joi.string().required(),
  sumberDana: Joi.string().allow(null, ''),
  anggaranSubKegiatan: Joi.number().min(0).default(0),
  tanggalMulai: Joi.date().iso().required(),
  tanggalSelesai: Joi.date().iso().required(),
  isWadah: Joi.boolean().default(false),
});

export const updateSubKegiatanSchema = Joi.object({
  nama: Joi.string(),
  penanggungJawab: Joi.string(),
  sumberDana: Joi.string().allow(null, ''),
  anggaranSubKegiatan: Joi.number().min(0),
  tanggalMulai: Joi.date().iso(),
  tanggalSelesai: Joi.date().iso(),
  status: Joi.string().valid('PERSIAPAN', 'KOORDINASI', 'PELAKSANAAN', 'EVALUASI', 'VERIFIKASI', 'SELESAI'),
  isWadah: Joi.boolean(),
});

export const createRealizationSchema = Joi.object({
  subKegiatanId: Joi.string().uuid().required(),
  jumlah: Joi.number().min(0).required(),
  keterangan: Joi.string().allow(null, ''),
  bulan: Joi.number().min(1).max(12).required(),
  tahun: Joi.number().min(2020).max(2100).required(),
});

export const updateStepSchema = Joi.object({
  completed: Joi.boolean(),
  catatan: Joi.string().allow(null, ''),
});

export const verificationSchema = Joi.object({
  subKegiatanId: Joi.string().uuid().required(),
  jenis: Joi.string().valid('FOTO', 'DOKUMEN', 'ABSENSI', 'LAPORAN').required(),
  nama: Joi.string().required(),
  fileUrl: Joi.string().uri().allow(null, ''),
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').default('PENDING'),
  catatan: Joi.string().allow(null, ''),
});
