import { RoleName } from '@prisma/client';

/**
 * Active context embedded in the JWT.
 * Identifies which college+club the user is currently operating as.
 */
export interface ActiveContext {
  role: string;
  collegeId: string | null;
  clubId: string | null;
  permissions: string[];
  orgType?: string | null;
  accountMode?: 'COLLEGE' | 'OPEN' | null;
  labels?: Record<string, string> | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  jti: string;
  activeContext: ActiveContext;
  allRoles?: Array<{
    role: string;
    collegeId: string;
    collegeName: string;
    clubId?: string;
    clubName?: string;
  }>;
  iat?: number;
  exp?: number;
}

/**
 * Refresh token payload — minimal, just identifies the user
 */
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}
