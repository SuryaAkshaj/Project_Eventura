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
    }
  }
}

export {};
