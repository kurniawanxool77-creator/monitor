import { Router } from 'express';
import authRoutes from './auth.routes.js';
import kegiatanRoutes from './kegiatan.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Simpel API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/kegiatan', kegiatanRoutes);

export default router;
