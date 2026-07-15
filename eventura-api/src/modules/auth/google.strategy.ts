import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { prismaAdmin } from '@config/database';
import { logger } from '@shared/utils/logger';
import type { RoleName } from '@prisma/client';

/**
 * Initialise the Passport Google OAuth 2.0 strategy.
 *
 * Reads credentials from process.env directly (not the Zod-validated `env`
 * object) so that the server can still boot in environments where Google
 * OAuth is not configured (e.g. local dev without credentials).
 */
export function initGoogleStrategy(): void {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    logger.warn('[AUTH] Google OAuth not configured — skipping (set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        passReqToCallback: true,
      },
      async (req, _accessToken, _refreshToken, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email returned from Google'), undefined);
          }

          const googleId = profile.id;
          const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
          const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
          const avatarUrl = profile.photos?.[0]?.value || null;

          // Read orgType passed through the OAuth state parameter
          const orgType = (req.query?.state as string) || 'UNIVERSITY';

          // ── Find existing user by googleId or email ────────────────────────
          let user = await prismaAdmin.user.findFirst({
            where: { OR: [{ googleId }, { email }] },
          });

          if (user) {
            // Link Google ID if user signed up via email first
            if (!user.googleId) {
              await prismaAdmin.user.update({
                where: { id: user.id },
                data: { googleId, avatarUrl: user.avatarUrl || avatarUrl },
              });
            }
          } else {
            // ── Create new user ──────────────────────────────────────────────
            // Determine account mode from email domain
            const domain = email.split('@')[1];
            const college = await prismaAdmin.college.findFirst({
              where: { domain, approvalStatus: 'APPROVED' },
            });

            const accountMode = college ? 'COLLEGE' : (orgType === 'UNIVERSITY' ? 'COLLEGE' : 'OPEN');
            const orgCategory = college?.orgCategory || (accountMode === 'OPEN' ? orgType : 'UNIVERSITY');

            user = await prismaAdmin.user.create({
              data: {
                email,
                firstName,
                lastName,
                avatarUrl,
                googleId,
                isEmailVerified: true,
                accountMode: accountMode as any,
                orgCategory,
              },
            });

            // Generate username
            const username = generateUsername(firstName, lastName, user.id);
            await prismaAdmin.user.update({
              where: { id: user.id },
              data: { username },
            });

            // Create ATTENDEE role assignment
            const role = await getOrCreateRole('ATTENDEE');
            const fallbackCollegeId = college?.id || await getOrCreateDefaultCollegeId();

            await prismaAdmin.roleAssignment.create({
              data: {
                userId: user.id,
                roleId: role.id,
                collegeId: fallbackCollegeId,
                status: 'APPROVED',
              },
            });
          }

          // Attach user data for the route handler
          return done(null, user);
        } catch (err) {
          logger.error('[AUTH] Google strategy error:', err);
          return done(err as Error, undefined);
        }
      },
    ),
  );

  logger.info('[AUTH] Google OAuth strategy initialized');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — duplicated from auth.service.ts to avoid circular imports
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_DB_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    'admin:platform', 'admin:approve',
    'events:read', 'events:write', 'events:delete', 'events:publish',
    'scanner:use', 'scanner:history',
    'finance:read', 'finance:manage',
    'members:read', 'members:manage',
  ],
  COLLEGE_ADMIN: [
    'events:read', 'events:write', 'events:delete', 'events:publish',
    'scanner:history',
    'finance:read', 'finance:manage',
    'members:read', 'members:manage',
    'admin:approve',
  ],
  CLUB_PRESIDENT: [
    'events:read', 'events:write', 'events:publish',
    'scanner:use', 'scanner:history',
    'finance:read',
    'members:read', 'members:manage',
  ],
  EVENT_MANAGER: [
    'events:read',
    'scanner:use', 'scanner:history',
  ],
  ATTENDEE: [
    'events:read',
  ],
};

async function getOrCreateRole(roleName: RoleName) {
  return prismaAdmin.role.upsert({
    where: { name: roleName },
    update: {},
    create: {
      name: roleName,
      permissions: {
        create: (ROLE_DB_PERMISSIONS[roleName] || ['events:read']).map(
          (action) => ({ action }),
        ),
      },
    },
  });
}

function generateUsername(firstName: string, lastName: string, id: string): string {
  const base = `${firstName}${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  const suffix = id.slice(0, 6);
  return `${base}${suffix}`;
}

async function getOrCreateDefaultCollegeId(): Promise<string> {
  const existing = await prismaAdmin.college.findFirst({
    where: { domain: 'general.eventura.app' },
  });
  if (existing) return existing.id;

  const created = await prismaAdmin.college.create({
    data: {
      name: 'General (Eventura)',
      domain: 'general.eventura.app',
      approvalStatus: 'APPROVED',
    },
  });
  return created.id;
}
