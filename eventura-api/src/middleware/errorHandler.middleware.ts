import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { error } from '@shared/utils/apiResponse';
import { logger } from '@shared/utils/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction): void {
  // Log the error with request context
  logger.error(`[${req.requestId ?? 'no-id'}] ${req.method} ${req.path} — ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    error(res, 'VALIDATION_ERROR', 'Request validation failed', details, 422);
    return;
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = (err.meta?.target as string[])?.join(', ') ?? 'field';
        error(res, 'DUPLICATE_ERROR', `${field} already exists`, undefined, 409);
        return;
      }
      case 'P2025': {
        // Record not found
        error(res, 'NOT_FOUND', 'Record not found', undefined, 404);
        return;
      }
      case 'P2003': {
        // Foreign key constraint
        error(res, 'CONSTRAINT_ERROR', 'Referenced record does not exist', undefined, 400);
        return;
      }
      case 'P2014': {
        // Required relation violation
        error(res, 'RELATION_ERROR', 'Required relation is missing', undefined, 400);
        return;
      }
      default:
        logger.error('Unhandled Prisma error code:', err.code);
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    error(res, 'DB_VALIDATION_ERROR', 'Database validation failed', undefined, 400);
    return;
  }

  // Custom app errors with statusCode or status
  if (err.statusCode || err.status) {
    const httpStatus = err.statusCode ?? err.status ?? 500;
    error(res, err.code ?? 'APP_ERROR', err.message, undefined, httpStatus);
    return;
  }

  // JWT errors (should be caught by auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error(res, 'INVALID_TOKEN', 'Authentication token is invalid or expired', undefined, 401);
    return;
  }

  // Unknown errors — don't expose internals in production
  const isDev = process.env.NODE_ENV === 'development';
  error(
    res,
    'INTERNAL_ERROR',
    isDev ? err.message : 'An unexpected error occurred',
    isDev ? err.stack : undefined,
    500,
  );
}
