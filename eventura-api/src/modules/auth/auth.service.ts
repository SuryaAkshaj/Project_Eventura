import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import { env } from '@config/env';
import { logger } from '@shared/utils/logger';
import { AppError } from '@shared/errors/AppError';
import { sendOTPEmail, sendPasswordResetEmail } from '@shared/utils/email';
import type { SignupDto, LoginDto, JwtPayload, TokenPair, OrgLabels } from './auth.types';
import { PERMISSIONS } from '@shared/constants/permissions';

// ─────────────────────────────────────────────────────────────────────────────
// Permission map — what permissions each role gets in their JWT
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS).flatMap((g) => Object.values(g)),
  COLLEGE_ADMIN: [
    PERMISSIONS.EVENTS.READ, PERMISSIONS.EVENTS.WRITE, PERMISSIONS.EVENTS.DELETE, PERMISSIONS.EVENTS.PUBLISH,
    PERMISSIONS.MEMBERS.READ, PERMISSIONS.MEMBERS.MANAGE,
    PERMISSIONS.FINANCE.READ, PERMISSIONS.FINANCE.MANAGE,
    PERMISSIONS.ADMIN.APPROVE,
  ],
  CLUB_PRESIDENT: [
    PERMISSIONS.EVENTS.READ, PERMISSIONS.EVENTS.WRITE, PERMISSIONS.EVENTS.PUBLISH,
    PERMISSIONS.SCANNER.USE, PERMISSIONS.SCANNER.VIEW_HISTORY,
    PERMISSIONS.MEMBERS.READ,
  ],
  EVENT_MANAGER: [
    PERMISSIONS.EVENTS.READ,
    PERMISSIONS.SCANNER.USE, PERMISSIONS.SCANNER.VIEW_HISTORY,
  ],
  ATTENDEE: [
    PERMISSIONS.EVENTS.READ,
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic org labels — maps orgCategory → contextual UI labels
// ─────────────────────────────────────────────────────────────────────────────
function getOrgLabels(orgCategory: string | null | undefined): OrgLabels {
  const map: Record<string, OrgLabels> = {
    UNIVERSITY: {
      team: 'Club',
      members: 'Students',
      teamAdmin: 'Club President',
      guests: 'Students',
    },
    COMPANY: {
      team: 'Department',
      members: 'Employees',
      teamAdmin: 'Department Head',
      guests: 'Clients',
    },
    COMMUNITY: {
      team: 'Chapter',
      members: 'Members',
      teamAdmin: 'Chapter Lead',
      guests: 'Guests',
    },
    CREATOR: {
      team: 'Brand',
      members: 'Fans',
      teamAdmin: 'Creator',
      guests: 'Subscribers',
    },
    NGO: {
      team: 'Chapter',
      members: 'Volunteers',
      teamAdmin: 'Chapter Head',
      guests: 'Donors',
    },
    GOVERNMENT: {
      team: 'Division',
      members: 'Staff',
      teamAdmin: 'Division Head',
      guests: 'Citizens',
    },
    SPORTS: {
      team: 'Squad',
      members: 'Athletes',
      teamAdmin: 'Team Captain',
      guests: 'Fans',
    },
    ENTERTAINMENT: {
      team: 'Brand',
      members: 'Artists',
      teamAdmin: 'Manager',
      guests: 'Fans',
    },
  };

  return map[orgCategory || 'UNIVERSITY'] || {
    team: 'Team',
    members: 'Members',
    teamAdmin: 'Team Admin',
    guests: 'Guests',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// generateTokenPair
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTokenPair(
  user: { id: string; email: string },
  activeContext: {
    role: string;
    collegeId: string | null;
    clubId: string | null;
    orgType?: string | null;
    accountMode?: 'COLLEGE' | 'OPEN' | null;
    labels?: OrgLabels | null;
  }
): Promise<TokenPair> {
  const permissions = ROLE_PERMISSIONS[activeContext.role] ?? [];

  // Generate a unique jti for blacklisting support
  const jti = uuidv4();

  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      activeContext: {
        ...activeContext,
        permissions,
        orgType: activeContext.orgType ?? null,
        accountMode: activeContext.accountMode ?? null,
        labels: activeContext.labels ?? null,
      },
      jti,
      iss: 'eventura-auth',
    } satisfies Omit<JwtPayload, 'iat' | 'exp'>,
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'] }
  );

  // Store refresh token in Redis using a per-session hash so multiple
  // concurrent logins (tabs / devices) don't overwrite each other.
  // Key:   refresh:sessions:<userId>
  // Field: first 16 chars of the token (fingerprint, not secret)
  // Value: the full token
  const TTL = 7 * 24 * 60 * 60; // 7 days in seconds
  const fingerprint = refreshToken.slice(-16); // last 16 chars are unique per token
  await redis.hset(`refresh:sessions:${user.id}`, fingerprint, refreshToken);
  await redis.expire(`refresh:sessions:${user.id}`, TTL);

  return { accessToken, refreshToken };
}

// ─────────────────────────────────────────────────────────────────────────────
// generateUsername — creates a URL-safe username from name + partial UUID
// ─────────────────────────────────────────────────────────────────────────────
function generateUsername(firstName: string, lastName: string, id: string): string {
  const base = `${firstName}${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
  const suffix = id.slice(0, 6); // Use part of UUID for uniqueness
  return `${base}${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// signup
// ─────────────────────────────────────────────────────────────────────────────
export async function signup(dto: SignupDto) {
  // Check for existing email
  const existing = await prismaAdmin.user.findUnique({ where: { email: dto.email } });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 'Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(dto.password, 12);

  // Determine account mode based on org category
  const accountMode = dto.orgCategory === 'UNIVERSITY' || !dto.orgCategory ? 'COLLEGE' : 'OPEN';

  // Get the Role record for the requested role
  const roleRecord = await prismaAdmin.role.findUnique({
    where: { name: dto.requestedRole },
  });
  if (!roleRecord) {
    throw new AppError('ROLE_CONFIG_ERROR', 'Role configuration error', 500);
  }

  // Create user with accountMode and orgCategory
  const user = await prismaAdmin.user.create({
    data: {
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      accountMode: accountMode as any,
      orgCategory: dto.orgCategory || 'UNIVERSITY',
    },
  });

  if (accountMode === 'OPEN') {
    // ── Open Mode: instant approval, no college/club required ──────────────
    // Use the general Eventura college as a fallback for role assignment
    const fallbackCollegeId = await getOrCreateDefaultCollegeId();
    await prismaAdmin.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id,
        collegeId: fallbackCollegeId,
        status: 'APPROVED',
      },
    });
  } else if (dto.requestedRole === 'ATTENDEE') {
    // Find college by email domain
    const domain = dto.email.split('@')[1];
    const college = await prismaAdmin.college.findUnique({ where: { domain } });

    await prismaAdmin.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id,
        collegeId: college?.id ?? (await getOrCreateDefaultCollegeId()),
        status: 'APPROVED',
      },
    });
  } else if (dto.requestedRole === 'COLLEGE_ADMIN') {
    const college = await prismaAdmin.college.create({
      data: {
        name: dto.collegeName!,
        domain: dto.collegeDomain!,
        orgCategory: dto.orgCategory || 'UNIVERSITY',
        approvalStatus: 'PENDING',
      },
    });

    await prismaAdmin.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id,
        collegeId: college.id,
        status: 'PENDING',
      },
    });
  } else if (dto.requestedRole === 'CLUB_PRESIDENT') {
    const college = await prismaAdmin.college.findUnique({ where: { id: dto.collegeId } });
    if (!college || college.approvalStatus !== 'APPROVED') {
      throw AppError.badRequest('College not found or not yet approved');
    }

    const club = await prismaAdmin.club.create({
      data: {
        name: dto.clubName!,
        collegeId: college.id,
        approvalStatus: 'PENDING',
      },
    });

    await prismaAdmin.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id,
        collegeId: college.id,
        clubId: club.id,
        status: 'PENDING',
      },
    });
  }

  // Auto-generate username from name
  const username = generateUsername(dto.firstName, dto.lastName, user.id);
  await prismaAdmin.user.update({
    where: { id: user.id },
    data: { username },
  });

  // Generate and store OTP using cryptographically secure random
  const otp = crypto.randomInt(100000, 999999).toString();
  await redis.set(`otp:${user.id}`, otp, 'EX', 600);

  // Send OTP via Resend email
  try {
    await sendOTPEmail(dto.email, otp, dto.firstName);
  } catch (emailErr) {
    // Email sending is non-critical for signup flow — log but don't fail
    logger.error('[EMAIL] Failed to send OTP email:', emailErr);
    logger.info(`[EVENTURA AUTH] OTP for ${user.email}: ${otp} (expires in 10 minutes)`);
  }

  return {
    user: { id: user.id, email: user.email, firstName: user.firstName },
    message: 'Verification OTP sent to your email',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyEmail
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyEmail(userId: string, otp: string): Promise<void> {
  const stored = await redis.get(`otp:${userId}`);
  if (!stored) {
    throw AppError.badRequest('OTP expired or invalid');
  }
  if (stored !== otp) {
    throw AppError.badRequest('Invalid OTP');
  }

  await prismaAdmin.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });

  await redis.del(`otp:${userId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — resolve orgCategory and labels for a given context
// ─────────────────────────────────────────────────────────────────────────────
async function resolveOrgLabels(
  collegeId: string | null,
  user: { accountMode: string; orgCategory: string | null },
) {
  // Fetch college orgCategory if we have a collegeId
  const college = collegeId
    ? await prismaAdmin.college.findUnique({
        where: { id: collegeId },
        select: { orgCategory: true },
      })
    : null;

  const orgCategory = college?.orgCategory ||
    (user.accountMode === 'OPEN' ? user.orgCategory : 'UNIVERSITY');

  const labels = getOrgLabels(orgCategory);

  return { orgType: orgCategory || 'UNIVERSITY', labels };
}

// ─────────────────────────────────────────────────────────────────────────────
// login
// ─────────────────────────────────────────────────────────────────────────────
export async function login(dto: LoginDto) {
  // ─── Brute force protection ───────────────────────────────────────────────
  const attemptKey = `login-attempts:${dto.email}`;
  const lockKey = `login-locked:${dto.email}`;

  const isLocked = await redis.get(lockKey);
  if (isLocked) {
    const ttl = await redis.ttl(lockKey);
    throw AppError.tooManyRequests(`Too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`);
  }
  // ─────────────────────────────────────────────────────────────────────────

  const user = await prismaAdmin.user.findUnique({ where: { email: dto.email } });
  if (!user || !user.passwordHash) {
    // Increment failed attempts even when user not found (prevent timing attacks)
    const attempts = await redis.incr(attemptKey);
    await redis.expire(attemptKey, 900);
    if (attempts >= 5) {
      await redis.setex(lockKey, 900, '1');
      await redis.del(attemptKey);
      throw new AppError('ACCOUNT_LOCKED', 'Too many failed attempts. Account locked for 15 minutes.', 429);
    }
    throw new AppError('INVALID_CREDENTIALS', `Invalid email or password. ${5 - attempts} attempts remaining.`, 401);
  }

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) {
    const attempts = await redis.incr(attemptKey);
    await redis.expire(attemptKey, 900);
    if (attempts >= 5) {
      await redis.setex(lockKey, 900, '1');
      await redis.del(attemptKey);
      throw new AppError('ACCOUNT_LOCKED', 'Too many failed attempts. Account locked for 15 minutes.', 429);
    }
    throw new AppError('INVALID_CREDENTIALS', `Invalid email or password. ${5 - attempts} attempts remaining.`, 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError('EMAIL_NOT_VERIFIED', 'Please verify your email before logging in', 403);
  }

  // Get role assignments with role data
  const roleAssignments = await prismaAdmin.roleAssignment.findMany({
    where: { userId: user.id },
    include: { role: true, college: true, club: true },
  });

  const approved = roleAssignments.filter((ra) => ra.status === 'APPROVED');
  const pending = roleAssignments.filter((ra) => ra.status === 'PENDING');

  // Update last login
  await prismaAdmin.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Clear failed attempts on successful login
  await redis.del(attemptKey);
  await redis.del(lockKey);

  const userInfo = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
  };

  // Zero approved roles — pending approval
  if (approved.length === 0) {
    if (pending.length > 0) {
      return {
        statusCode: 202,
        requiresApproval: true,
        user: userInfo,
        tokenPair: null,
      };
    }
    throw new AppError('NO_ROLE', 'No role assigned to this account', 403);
  }

  // Multiple roles — ask frontend to select
  if (approved.length > 1) {
    const roles = approved.map((ra) => ({
      roleAssignmentId: ra.id,
      role: ra.role.name,
      collegeId: ra.collegeId,
      collegeName: ra.college?.name,
      clubId: ra.clubId,
      clubName: ra.club?.name,
    }));
    return {
      statusCode: 206,
      requiresContextSelection: true,
      roles,
      user: userInfo,
      tokenPair: null,
    };
  }

  // Single approved role — auto-select
  const ra = approved[0];
  const { orgType, labels } = await resolveOrgLabels(ra.collegeId, user as any);
  const activeContext = {
    role: ra.role.name,
    collegeId: ra.collegeId,
    clubId: ra.clubId,
    orgType,
    accountMode: user.accountMode as 'COLLEGE' | 'OPEN',
    labels,
  };
  const tokenPair = await generateTokenPair(user, activeContext);

  return {
    statusCode: 200,
    user: userInfo,
    tokenPair,
    activeContext,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// refreshToken
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshToken(token: string): Promise<TokenPair & { activeContext: { role: string; collegeId: string | null; clubId: string | null; orgType: string | null; accountMode: 'COLLEGE' | 'OPEN' | null; labels: OrgLabels | null } }> {
  let payload: any;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const TTL = 7 * 24 * 60 * 60;
  const fingerprint = token.slice(-16);

  // Check new per-session hash first
  let stored = await redis.hget(`refresh:sessions:${payload.sub}`, fingerprint);

  // ── Backward-compat: check the old single-key format ─────────────────────
  // Browsers that have a cookie from before the multi-session migration will
  // hit this path. Accept the token and silently migrate it to the new format.
  if (!stored) {
    const legacyStored = await redis.get(`refresh:${payload.sub}`);
    if (legacyStored && legacyStored === token) {
      // Migrate: write into new hash, delete old key
      await redis.hset(`refresh:sessions:${payload.sub}`, fingerprint, token);
      await redis.expire(`refresh:sessions:${payload.sub}`, TTL);
      await redis.del(`refresh:${payload.sub}`);
      stored = token; // treat as valid
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (!stored || stored !== token) {
    throw AppError.unauthorized('Refresh token revoked or invalid');
  }

  const user = await prismaAdmin.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw AppError.unauthorized('User not found');
  }

  // Get current active role assignment
  const roleAssignments = await prismaAdmin.roleAssignment.findMany({
    where: { userId: user.id, status: 'APPROVED' },
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });

  const ra = roleAssignments[0];
  const baseContext = ra
    ? { role: ra.role.name, collegeId: ra.collegeId, clubId: ra.clubId }
    : { role: 'ATTENDEE', collegeId: null, clubId: null };

  const { orgType, labels } = await resolveOrgLabels(baseContext.collegeId, user as any);
  const activeContext = {
    ...baseContext,
    orgType,
    accountMode: user.accountMode as 'COLLEGE' | 'OPEN',
    labels,
  };

  // Rotate refresh token: remove old session fingerprint, issue new token
  await redis.hdel(`refresh:sessions:${user.id}`, fingerprint);
  const tokenPair = await generateTokenPair(user, activeContext);
  return { ...tokenPair, activeContext };
}

// ─────────────────────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(userId: string, accessToken: string, refreshToken?: string): Promise<void> {
  try {
    // Decode token to get jti and expiry
    const decoded = jwt.decode(accessToken) as any;
    const jti = decoded?.jti;
    const exp = decoded?.exp;

    if (jti && exp) {
      // Blacklist by jti with TTL = remaining token lifetime
      const ttl = exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setex(`blacklist:${jti}`, ttl, '1');
      }
    }
  } catch {
    // Best-effort blacklisting
  }

  // Remove only this session's refresh token (not all sessions)
  if (refreshToken) {
    const fingerprint = refreshToken.slice(-16);
    await redis.hdel(`refresh:sessions:${userId}`, fingerprint);
  } else {
    // Fallback: clear all sessions for this user (legacy behaviour)
    await redis.del(`refresh:sessions:${userId}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getApprovalStatus
// ─────────────────────────────────────────────────────────────────────────────
export async function getApprovalStatus(userId: string) {
  const user = await prismaAdmin.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const ra = await prismaAdmin.roleAssignment.findFirst({
    where: { userId },
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });

  return {
    emailVerified: user.isEmailVerified,
    identityVerified: user.isEmailVerified && ra?.status === 'APPROVED',
    superAdminApproval: ra?.status ?? 'PENDING',
    role: ra?.role.name ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// contextSwitch
// ─────────────────────────────────────────────────────────────────────────────
export async function contextSwitch(
  userId: string,
  roleAssignmentId: string,
  collegeId?: string | null,
  clubId?: string | null
): Promise<TokenPair> {
  const ra = await prismaAdmin.roleAssignment.findFirst({
    where: { id: roleAssignmentId, userId, status: 'APPROVED' },
    include: { role: true },
  });

  if (!ra) {
    throw AppError.forbidden('Role assignment not found or not approved');
  }

  if (ra.expiresAt && ra.expiresAt < new Date()) {
    throw AppError.forbidden('Role assignment has expired');
  }

  const user = await prismaAdmin.user.findUniqueOrThrow({ where: { id: userId } });
  const { orgType, labels } = await resolveOrgLabels(ra.collegeId, user as any);
  const activeContext = {
    role: ra.role.name,
    collegeId: ra.collegeId,
    clubId: ra.clubId,
    orgType,
    accountMode: user.accountMode as 'COLLEGE' | 'OPEN',
    labels,
  };

  return generateTokenPair(user, activeContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// forgotPassword
// ─────────────────────────────────────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
  // Silently succeed even if user not found (prevent email enumeration)
  const user = await prismaAdmin.user.findUnique({ where: { email } });
  if (!user) return;

  // Use cryptographically secure random OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  await redis.set(`reset:${user.id}`, otp, 'EX', 900);

  // Send password reset email via Resend
  try {
    await sendPasswordResetEmail(email, otp, user.firstName);
  } catch (emailErr) {
    logger.error('[EMAIL] Failed to send password reset email:', emailErr);
    logger.info(`[EVENTURA AUTH] Password reset OTP for ${email}: ${otp}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// resetPassword
// ─────────────────────────────────────────────────────────────────────────────
export async function resetPassword(userId: string, otp: string, newPassword: string): Promise<void> {
  const stored = await redis.get(`reset:${userId}`);
  if (!stored) {
    throw AppError.badRequest('OTP expired or invalid');
  }
  if (stored !== otp) {
    throw AppError.badRequest('Invalid OTP');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prismaAdmin.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await redis.del(`reset:${userId}`);
  await redis.del(`refresh:${userId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// getMe — return current user's profile (safe fields only)
// ─────────────────────────────────────────────────────────────────────────────
export async function getMe(userId: string) {
  const user = await prismaAdmin.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isEmailVerified: true,
    },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  // Fetch the most recent approved role assignment to get college + club names
  const ra = await prismaAdmin.roleAssignment.findFirst({
    where: { userId, status: 'APPROVED' },
    include: {
      college: { select: { id: true, name: true } },
      club: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    ...user,
    collegeName: ra?.college?.name ?? null,
    clubName: ra?.club?.name ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — get or create a fallback college ID for attendees with unknown domains
// ─────────────────────────────────────────────────────────────────────────────
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
