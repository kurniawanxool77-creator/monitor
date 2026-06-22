import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.frontendUrl,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Terlalu banyak request, coba lagi nanti',
  },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging (morgan)
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body', {
  skip: (req) => req.url === '/health',
}));

// API Routes
app.use(`/api/${config.apiVersion}`, routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Simpel Backend API',
    version: config.apiVersion,
    docs: `/api/${config.apiVersion}/health`,
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`, {
    env: config.env,
    nodeVersion: process.version,
  });
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║  🚀 Simpel Backend API                                ║
  ╠══════════════════════════════════════════════════════╣
  ║  Environment : ${config.env.padEnd(38)}║
  ║  Port        : ${String(config.port).padEnd(38)}║
  ║  API Version  : ${config.apiVersion.padEnd(38)}║
  ║  Health Check : http://localhost:${config.port}/api/${config.apiVersion}/health ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
