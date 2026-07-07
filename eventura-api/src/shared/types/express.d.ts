import { RoleName } from '@prisma/client';
import { JwtPayload } from './jwt.types';

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by auth.middleware.ts after JWT verification.
       * Contains the full decoded JWT payload including user context.
       */
      user?: JwtPayload;

      /**
       * Unique request ID injected by requestLogger.middleware.ts
       */
      requestId?: string;

      /**
       * Client IP address extracted by auth.middleware.ts
       */
      ipAddress?: string;

      /**
       * Browser/device user agent extracted by auth.middleware.ts
       */
      userAgent?: string;
    }
  }
}

export {};
