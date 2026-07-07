import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import { bulkCertRateLimiter } from '@middleware/rateLimiter.middleware';
import * as certificatesController from './certificates.controller';

const router = Router();

// Public — verify a certificate (no auth needed)
router.get('/verify/:certificateId', certificatesController.verifyCertificate);

// Download PDF (no auth — link shared via email)
router.get('/download/:certificateId', certificatesController.downloadCertificate);

// Attendee routes
router.post('/generate', authMiddleware, certificatesController.generateCertificate);
router.get('/my', authMiddleware, certificatesController.getMyCertificates);

// Organiser routes
router.post(
  '/bulk',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  bulkCertRateLimiter,
  certificatesController.bulkGenerateCertificates
);

export default router;
