import { Router } from 'express';
import kegiatanController from '../controllers/kegiatan.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBidangSchema,
  updateBidangSchema,
  createUraianSchema,
  updateUraianSchema,
  createSubKegiatanSchema,
  updateSubKegiatanSchema,
  createRealizationSchema,
  updateStepSchema,
} from '../validations/kegiatan.validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============ BIDANG ============
router.get('/bidang', kegiatanController.getAllBidang);
router.get('/bidang/:id', kegiatanController.getBidangById);
router.post('/bidang', authorize('SUPERADMIN', 'ADMIN'), validate(createBidangSchema), kegiatanController.createBidang);
router.patch('/bidang/:id', authorize('SUPERADMIN', 'ADMIN'), validate(updateBidangSchema), kegiatanController.updateBidang);
router.delete('/bidang/:id', authorize('SUPERADMIN'), kegiatanController.deleteBidang);

// ============ URAIAN ============
router.get('/uraian', kegiatanController.getAllUraian);
router.post('/uraian', authorize('SUPERADMIN', 'ADMIN'), validate(createUraianSchema), kegiatanController.createUraian);
router.patch('/uraian/:id', authorize('SUPERADMIN', 'ADMIN'), validate(updateUraianSchema), kegiatanController.updateUraian);
router.delete('/uraian/:id', authorize('SUPERADMIN', 'ADMIN'), kegiatanController.deleteUraian);

// ============ SUB KEGIATAN ============
router.get('/sub-kegiatan', kegiatanController.getAllSubKegiatan);
router.get('/sub-kegiatan/:id', kegiatanController.getSubKegiatanById);
router.post('/sub-kegiatan', authorize('SUPERADMIN', 'ADMIN'), validate(createSubKegiatanSchema), kegiatanController.createSubKegiatan);
router.patch('/sub-kegiatan/:id', authorize('SUPERADMIN', 'ADMIN'), validate(updateSubKegiatanSchema), kegiatanController.updateSubKegiatan);

// ============ STEPS ============
router.patch('/steps/:id', validate(updateStepSchema), kegiatanController.updateStep);

// ============ REALISASI ============
router.get('/realisasi', kegiatanController.getRealizations);
router.post('/realisasi', authorize('SUPERADMIN', 'ADMIN', 'USER'), validate(createRealizationSchema), kegiatanController.createRealization);

// ============ ANGGARAN SUMMARY ============
router.get('/anggaran/summary', kegiatanController.getAnggaranSummary);

// ============ ACTIVITY LOGS ============
router.get('/activity-logs', kegiatanController.getActivityLogs);

export default router;
