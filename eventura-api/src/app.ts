/// <reference path="./shared/types/express.d.ts" />
import 'dotenv/config';
import { env } from '@config/env'; // Validates all env vars at startup
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestIdMiddleware, requestLogger } from '@middleware/requestLogger.middleware';
import { generalRateLimiter } from '@middleware/rateLimiter.middleware';
import { errorHandler } from '@middleware/errorHandler.middleware';
import cookieParser from 'cookie-parser';
import healthRouter from '@modules/health/health.routes';
import authRouter from '@modules/auth/auth.routes';
import collegesRouter from '@modules/colleges/colleges.routes';
import eventsRouter from '@modules/events/events.routes';
import registrationsRoutes from '@modules/registrations/registrations.routes';
import qrRoutes from '@modules/qr/qr.routes';
import paymentsRoutes from '@modules/payments/payments.routes';
import adminRoutes from '@modules/admin/admin.routes';
import certificatesRoutes from '@modules/certificates/certificates.routes';
import { logger } from '@shared/utils/logger';
import { sanitizeObject } from '@shared/utils/sanitize';

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE CHAIN (order matters)
// ─────────────────────────────────────────────────────────────────────────────

// 1. Security headers — enhanced CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["https://api.razorpay.com"],
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }
}));

// 2. CORS — strict origin whitelist
const allowedOrigins = env.NODE_ENV === 'production'
  ? [env.CLIENT_URL]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'x-idempotency-key', 'x-razorpay-signature'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
}));

// 3. Cookie parser (required for HTTP-only refresh token)
app.use(cookieParser());

// 4. Body parsing
// Raw body for Razorpay webhook signature verification (must come BEFORE express.json)
app.use('/payments/webhook', express.raw({ type: 'application/json' }));
app.use((req, _res, next) => {
  if (req.path === '/payments/webhook' && Buffer.isBuffer(req.body)) {
    (req as any).rawBody = req.body.toString('utf-8');
  }
  next();
});
// JSON body for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4a. Sanitize all request bodies against XSS (skip webhook path — raw body)
app.use((req, _res, next) => {
  if (req.body && req.path !== '/payments/webhook') {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// 5. Request ID + HTTP logging
app.use(requestIdMiddleware);
app.use(requestLogger);

// 6. Rate limiting
app.use(generalRateLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Health check — public, no auth required
app.use('/health', healthRouter);

// Auth — public, rate-limited (Mission 3)
app.use('/auth', authRouter);

// Colleges — public read endpoints (Mission 3)
app.use('/colleges', collegesRouter);

// Events — Mission 5A
app.use('/events', eventsRouter);

// Registrations — Mission 6
app.use('/registrations', registrationsRoutes);
app.use('/qr', qrRoutes);

// Payments — Mission 7
app.use('/payments', paymentsRoutes);

// Admin — Mission 8
app.use('/admin', adminRoutes);

// Certificates — Mission 9
app.use('/certificates', certificatesRoutes);

// API v1 routes — to be added in future missions
// app.use('/api/v1/events', authMiddleware, tenantMiddleware, eventsRouter);
// app.use('/api/v1/clubs', authMiddleware, tenantMiddleware, clubsRouter);
// app.use('/api/v1/registrations', authMiddleware, tenantMiddleware, registrationsRouter);
// app.use('/api/v1/qr', authMiddleware, tenantMiddleware, scanRateLimiter, qrRouter);
// app.use('/api/v1/payments', authMiddleware, tenantMiddleware, paymentsRouter);
// app.use('/api/v1/certificates', authMiddleware, tenantMiddleware, certificatesRouter);
// app.use('/api/v1/admin', authMiddleware, requireRole('SUPER_ADMIN'), adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER — must be last
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Eventura API running on http://localhost:${env.PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   Health check: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
