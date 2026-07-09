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
import bookmarksRoutes from '@modules/bookmarks/bookmarks.routes';
import { logger } from '@shared/utils/logger';
import { sanitizeObject } from '@shared/utils/sanitize';
import { prisma, prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger';

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE CHAIN (order matters)
// ─────────────────────────────────────────────────────────────────────────────

// 1. Security headers — enhanced CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "https://checkout.razorpay.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc:  ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31_536_000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // Required for Razorpay iframe
}));

// Additional headers not covered by Helmet
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// 2. CORS — strict origin whitelist
const allowedOrigins: (string | RegExp)[] = env.NODE_ENV === 'production'
  ? [
      env.CLIENT_URL,
      /https:\/\/eventura-.*\.vercel\.app$/,   // Vercel preview deployments
    ]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow curl/Postman

    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );

    if (allowed) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
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
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use((req, _res, next) => {
  if (req.path === '/api/v1/payments/webhook' && Buffer.isBuffer(req.body)) {
    (req as any).rawBody = req.body.toString('utf-8');
  }
  next();
});
// JSON body for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4a. Sanitize all request bodies against XSS (skip webhook path — raw body)
app.use((req, _res, next) => {
  if (req.body && req.path !== '/api/v1/payments/webhook') {
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
// SWAGGER API DOCS
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Eventura API Docs',
  customCss: '.swagger-ui .topbar { background-color: #2E3192; }',
}));

app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Health check — public, no auth required
app.use('/health', healthRouter);

// API v1 routes — all versioned under /api/v1/
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/colleges', collegesRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/registrations', registrationsRoutes);
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/certificates', certificatesRoutes);
app.use('/api/v1/bookmarks', bookmarksRoutes);

// Backward-compatibility redirects for old unversioned routes
// These forward requests to the /api/v1/ equivalents
app.use('/auth', (req, res) => res.redirect(307, `/api/v1/auth${req.url}`));
app.use('/colleges', (req, res) => res.redirect(307, `/api/v1/colleges${req.url}`));
app.use('/events', (req, res) => res.redirect(307, `/api/v1/events${req.url}`));
app.use('/registrations', (req, res) => res.redirect(307, `/api/v1/registrations${req.url}`));
app.use('/qr', (req, res) => res.redirect(307, `/api/v1/qr${req.url}`));
app.use('/payments', (req, res) => res.redirect(307, `/api/v1/payments${req.url}`));
app.use('/admin', (req, res) => res.redirect(307, `/api/v1/admin${req.url}`));
app.use('/certificates', (req, res) => res.redirect(307, `/api/v1/certificates${req.url}`));

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

import { runProductionSeed } from '@shared/utils/seed';

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────
const server = app.listen(env.PORT, async () => {
  logger.info(`✅ Server running on port ${env.PORT}`);
  logger.info(`✅ Environment: ${env.NODE_ENV}`);
  
  if (env.NODE_ENV === 'production') {
    await runProductionSeed();
  }
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received — starting graceful shutdown`);

  // Stop accepting new connections immediately
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      await prismaAdmin.$disconnect();
      logger.info('PostgreSQL disconnected');

      await redis.quit();
      logger.info('Redis disconnected');

      logger.info('✅ Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force kill after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown — 30s timeout exceeded');
    process.exit(1);
  }, 30_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection:', reason);
  if (env.NODE_ENV === 'development') throw reason;
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  shutdown('uncaughtException');
});

export default app;
