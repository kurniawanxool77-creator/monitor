import { Router } from 'express';
import authRoutes from './auth.routes.js';
import kegiatanRoutes from './kegiatan.routes.js';
import adminRoutes from './admin.routes.js';
import sumberDanaRoutes from './sumberdana.routes.js';
import userRoutes from './user.routes.js';

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
router.use('/admin', adminRoutes);
router.use('/sumber-dana', sumberDanaRoutes);
router.use('/users', userRoutes);

export default router;
