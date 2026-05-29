import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prismaAdmin } from '@config/database';
import { redis } from '@config/redis';
import { env } from '@config/env';
import { logger } from '@shared/utils/logger';
import type { SignupDto, LoginDto, JwtPayload, TokenPair } from './auth.types';
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
// generateTokenPair
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTokenPair(
  user: { id: string; email: string },
  activeContext: { role: string; collegeId: string | null; clubId: string | null }
): Promise<TokenPair> {
  const permissions = ROLE_PERMISSIONS[activeContext.role] ?? [];

  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      activeContext: { ...activeContext, permissions },
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

  // Store refresh token in Redis (7 days TTL)
  await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

  return { accessToken, refreshToken };
}

// ─────────────────────────────────────────────────────────────────────────────
// signup
// ─────────────────────────────────────────────────────────────────────────────
export async function signup(dto: SignupDto) {
  // Check for existing email
  const existing = await prismaAdmin.user.findUnique({ where: { email: dto.email } });
  if (existing) {
    const err: any = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(dto.password, 12);

  // Get the Role record for the requested role
  const roleRecord = await prismaAdmin.role.findUnique({
    where: { name: dto.requestedRole },
  });
  if (!roleRecord) {
    const err: any = new Error('Role configuration error');
    err.statusCode = 500;
    throw err;
  }

  // Create user
  const user = await prismaAdmin.user.create({
    data: {
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    },
  });

  if (dto.requestedRole === 'ATTENDEE') {
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
      const err: any = new Error('College not found or not yet approved');
      err.statusCode = 400;
      throw err;
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

  // Generate and store OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`otp:${user.id}`, otp, 'EX', 600);

  // Log OTP to console (dev mode — no email sending)
  logger.info(`[EVENTURA AUTH] OTP for ${user.email}: ${otp} (expires in 10 minutes)`);

  return {
    user: { id: user.id, email: user.email, firstName: user.firstName },
    message: 'Verification OTP sent to console (dev mode)',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyEmail
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyEmail(userId: string, otp: string): Promise<void> {
  const stored = await redis.get(`otp:${userId}`);
  if (!stored) {
    const err: any = new Error('OTP expired or invalid');
    err.statusCode = 400;
    throw err;
  }
  if (stored !== otp) {
    const err: any = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  await prismaAdmin.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });

  await redis.del(`otp:${userId}`);
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
    const err: any = new Error(`Too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`);
    err.code = 'ACCOUNT_LOCKED';
    err.status = 429;
    throw err;
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
      const err: any = new Error('Too many failed attempts. Account locked for 15 minutes.');
      err.code = 'ACCOUNT_LOCKED';
      err.status = 429;
      throw err;
    }
    const err: any = new Error(`Invalid email or password. ${5 - attempts} attempts remaining.`);
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) {
    const attempts = await redis.incr(attemptKey);
    await redis.expire(attemptKey, 900);
    if (attempts >= 5) {
      await redis.setex(lockKey, 900, '1');
      await redis.del(attemptKey);
      const err: any = new Error('Too many failed attempts. Account locked for 15 minutes.');
      err.code = 'ACCOUNT_LOCKED';
      err.status = 429;
      throw err;
    }
    const err: any = new Error(`Invalid email or password. ${5 - attempts} attempts remaining.`);
    err.code = 'INVALID_CREDENTIALS';
    err.status = 401;
    throw err;
  }

  if (!user.isEmailVerified) {
    const err: any = new Error('Email not verified');
    err.statusCode = 403;
    err.code = 'EMAIL_NOT_VERIFIED';
    err.userId = user.id;
    throw err;
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
    const err: any = new Error('No role assigned to this account');
    err.statusCode = 403;
    throw err;
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
  const activeContext = {
    role: ra.role.name,
    collegeId: ra.collegeId,
    clubId: ra.clubId,
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
export async function refreshToken(token: string): Promise<TokenPair> {
  let payload: any;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    const err: any = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  const stored = await redis.get(`refresh:${payload.sub}`);
  if (!stored || stored !== token) {
    const err: any = new Error('Refresh token revoked or invalid');
    err.statusCode = 401;
    throw err;
  }

  const user = await prismaAdmin.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }

  // Get current active role assignment
  const roleAssignments = await prismaAdmin.roleAssignment.findMany({
    where: { userId: user.id, status: 'APPROVED' },
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });

  const ra = roleAssignments[0];
  const activeContext = ra
    ? { role: ra.role.name, collegeId: ra.collegeId, clubId: ra.clubId }
    : { role: 'ATTENDEE', collegeId: null, clubId: null };

  // Rotate refresh token
  await redis.del(`refresh:${user.id}`);
  return generateTokenPair(user, activeContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(userId: string, accessToken: string): Promise<void> {
  try {
    const decoded = jwt.decode(accessToken) as any;
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.set(`blacklist:${accessToken}`, 'true', 'EX', ttl);
      }
    }
  } catch {
    // Best-effort blacklisting
  }

  await redis.del(`refresh:${userId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// getApprovalStatus
// ─────────────────────────────────────────────────────────────────────────────
export async function getApprovalStatus(userId: string) {
  const user = await prismaAdmin.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 404;
    throw err;
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
    const err: any = new Error('Role assignment not found or not approved');
    err.statusCode = 403;
    throw err;
  }

  if (ra.expiresAt && ra.expiresAt < new Date()) {
    const err: any = new Error('Role assignment has expired');
    err.statusCode = 403;
    throw err;
  }

  const user = await prismaAdmin.user.findUniqueOrThrow({ where: { id: userId } });
  const activeContext = {
    role: ra.role.name,
    collegeId: ra.collegeId,
    clubId: ra.clubId,
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

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`reset:${user.id}`, otp, 'EX', 900);

  logger.info(`[EVENTURA AUTH] Password reset OTP for ${email}: ${otp}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// resetPassword
// ─────────────────────────────────────────────────────────────────────────────
export async function resetPassword(userId: string, otp: string, newPassword: string): Promise<void> {
  const stored = await redis.get(`reset:${userId}`);
  if (!stored) {
    const err: any = new Error('OTP expired or invalid');
    err.statusCode = 400;
    throw err;
  }
  if (stored !== otp) {
    const err: any = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
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
