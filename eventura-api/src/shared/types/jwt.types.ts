import { RoleName } from '@prisma/client';

/**
 * Active context embedded in the JWT.
 * Identifies which college+club the user is currently operating as.
 */
export interface ActiveContext {
  collegeId: string;
  collegeRole: RoleName;
  clubId?: string;
  permissions: string[];
}

/**
 * Full JWT access token payload
 */
export interface JwtPayload {
  /** User's database UUID */
  sub: string;

  /** User's email */
  email: string;

  /** User's display name */
  name: string;

  /** JWT ID — used for blacklisting on logout */
  jti: string;

  /** The active context (which college/role the user is acting as right now) */
  activeContext: ActiveContext;

  /** All role assignments — for role switcher in the frontend */
  allRoles: Array<{
    role: RoleName;
    collegeId: string;
    collegeName: string;
    clubId?: string;
    clubName?: string;
  }>;

  /** Standard JWT fields */
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
