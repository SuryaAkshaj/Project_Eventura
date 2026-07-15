import { Router } from 'express';
import passport from 'passport';
import {
  loginRateLimiter,
  authRateLimiter,
  otpRateLimiter,
  forgotPasswordRateLimiter,
  sessionRateLimiter,
} from '@middleware/rateLimiter.middleware';
import { authMiddleware } from '@middleware/auth.middleware';
import { asyncHandler } from '@shared/utils/asyncHandler';
import { prismaAdmin } from '@config/database';
import { AppError } from '@shared/errors/AppError';
import { env } from '@config/env';
import { generateTokenPair } from './auth.service';
import * as authController from './auth.controller';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@woxsen.edu.in
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */

// ── Public — no auth required ────────────────────────────────────────────────

// ── Google OAuth ─────────────────────────────────────────────────────────────

// GET /auth/google — redirect to Google login page
router.get('/google', (req, res, next) => {
  const orgType = (req.query.orgType as string) || 'UNIVERSITY';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: orgType,
  })(req, res, next);
});

// GET /auth/google/callback — Google redirects here after auth
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=google_failed`,
  }),
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      return res.redirect(`${env.CLIENT_URL}/login?error=google_failed`);
    }

    // Read orgType from state parameter
    const orgType = (req.query.state as string) || 'UNIVERSITY';

    // Get role assignments
    const roleAssignments = await prismaAdmin.roleAssignment.findMany({
      where: { userId: user.id, status: 'APPROVED' },
      include: { role: true, college: true },
      orderBy: { createdAt: 'desc' },
    });

    const ra = roleAssignments[0];
    const roleName = ra?.role?.name || 'ATTENDEE';

    // Resolve org labels — same pattern as regular login
    const college = ra?.collegeId
      ? await prismaAdmin.college.findUnique({
          where: { id: ra.collegeId },
          select: { orgCategory: true },
        })
      : null;

    const orgCategory = college?.orgCategory ||
      (user.accountMode === 'OPEN' ? user.orgCategory : 'UNIVERSITY');

    const labelsMap: Record<string, { team: string; members: string; teamAdmin: string; guests: string }> = {
      UNIVERSITY:    { team: 'Club',       members: 'Students',   teamAdmin: 'Club President',  guests: 'Students' },
      COMPANY:       { team: 'Department', members: 'Employees',  teamAdmin: 'Department Head', guests: 'Clients' },
      COMMUNITY:     { team: 'Chapter',    members: 'Members',    teamAdmin: 'Chapter Lead',    guests: 'Guests' },
      CREATOR:       { team: 'Brand',      members: 'Fans',       teamAdmin: 'Creator',         guests: 'Subscribers' },
      NGO:           { team: 'Chapter',    members: 'Volunteers', teamAdmin: 'Chapter Head',    guests: 'Donors' },
      GOVERNMENT:    { team: 'Division',   members: 'Staff',      teamAdmin: 'Division Head',   guests: 'Citizens' },
      SPORTS:        { team: 'Squad',      members: 'Athletes',   teamAdmin: 'Team Captain',    guests: 'Fans' },
      ENTERTAINMENT: { team: 'Brand',      members: 'Artists',    teamAdmin: 'Manager',         guests: 'Fans' },
    };

    const labels = labelsMap[orgCategory || 'UNIVERSITY'] || {
      team: 'Team', members: 'Members', teamAdmin: 'Team Admin', guests: 'Guests',
    };

    const activeContext = {
      role: roleName,
      collegeId: ra?.collegeId || null,
      clubId: ra?.clubId || null,
      orgType: orgCategory || 'UNIVERSITY',
      accountMode: user.accountMode as 'COLLEGE' | 'OPEN',
      labels,
    };

    const tokenPair = await generateTokenPair(user, activeContext);

    // Update last login
    await prismaAdmin.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Redirect to frontend success page with token + context
    const redirectUrl = new URL(`${env.CLIENT_URL}/auth/google/success`);
    redirectUrl.searchParams.set('token', tokenPair.accessToken);
    redirectUrl.searchParams.set('mode', user.accountMode || 'COLLEGE');
    redirectUrl.searchParams.set('role', roleName);
    res.redirect(redirectUrl.toString());
  }),
);

// GET /auth/profile/:username — public profile (no auth required)
router.get('/profile/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await prismaAdmin.user.findFirst({
    where: { username },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatarUrl: true,
      createdAt: true,
      // Get their college via role assignments
      roleAssignments: {
        where: { status: 'APPROVED' },
        include: {
          college: {
            select: { name: true, city: true, logoUrl: true, slug: true }
          },
          role: { select: { name: true } }
        },
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) throw AppError.notFound('Profile not found');

  // Get their attended events (CHECKED_IN registrations)
  const attendedEvents = await prismaAdmin.registration.findMany({
    where: { userId: user.id, status: 'CHECKED_IN' },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          eventType: true,
          college: { select: { name: true } },
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Get their certificates
  const certificates = await prismaAdmin.certificate.findMany({
    where: { registration: { userId: user.id } },
    include: {
      registration: {
        include: {
          event: {
            select: {
              title: true,
              startDate: true,
              college: { select: { name: true } },
            }
          }
        }
      }
    },
    orderBy: { issuedAt: 'desc' },
    take: 10,
  });

  return res.json({
    success: true,
    data: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      college: user.roleAssignments[0]?.college || null,
      role: user.roleAssignments[0]?.role?.name || 'ATTENDEE',
      memberSince: user.createdAt,
      stats: {
        eventsAttended: attendedEvents.length,
        certificatesEarned: certificates.length,
      },
      attendedEvents: attendedEvents.map(r => r.event),
      certificates: certificates.map(c => ({
        id: c.id,
        eventTitle: c.registration.event.title,
        eventDate: c.registration.event.startDate,
        collegeName: c.registration.event.college?.name,
        issuedAt: c.issuedAt,
        pdfUrl: c.pdfUrl,
      })),
    }
  });
}));

// ── Session management — relaxed limit (60/min) ──────────────────────────────
// These are called on every page load by AuthInitializer, not brute-force targets.
router.post('/refresh', sessionRateLimiter, authController.refreshToken);
router.get('/me', sessionRateLimiter, authMiddleware, authController.getMe);

// GET /auth/me/username — get current user's username
router.get('/me/username', authMiddleware, asyncHandler(async (req, res) => {
  const user = await prismaAdmin.user.findUnique({
    where: { id: req.user!.sub },
    select: { username: true }
  });
  return res.json({ success: true, data: { username: user?.username } });
}));

// PATCH /auth/me/username — update username
router.patch('/me/username', authMiddleware, asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    throw AppError.badRequest('Username is required');
  }

  // Validate: 3-30 chars, alphanumeric + hyphens only
  const usernameRegex = /^[a-z0-9-]{3,30}$/;
  if (!usernameRegex.test(username)) {
    throw AppError.badRequest(
      'Username must be 3-30 characters, lowercase letters, numbers, and hyphens only'
    );
  }

  // Check availability
  const existing = await prismaAdmin.user.findFirst({
    where: { username }
  });
  if (existing && existing.id !== req.user!.sub) {
    throw AppError.conflict('Username is already taken');
  }

  const updated = await prismaAdmin.user.update({
    where: { id: req.user!.sub },
    data: { username },
    select: { username: true }
  });

  return res.json({
    success: true,
    data: updated,
    message: 'Username updated successfully'
  });
}));

// ── Sensitive auth endpoints — granular per-action limits ────────────────────
router.post('/login',           loginRateLimiter,           authController.login);
router.post('/signup',          authRateLimiter,             authController.signup);
router.post('/verify-email',    otpRateLimiter,              authController.verifyEmail);
router.post('/forgot-password', forgotPasswordRateLimiter,   authController.forgotPassword);
router.post('/reset-password',  otpRateLimiter,              authController.resetPassword);
router.post('/logout',          authRateLimiter,             authController.logout);
router.get('/status',           authRateLimiter,             authController.getApprovalStatus);
router.post('/context-switch',  authRateLimiter,             authController.contextSwitch);

export default router;
