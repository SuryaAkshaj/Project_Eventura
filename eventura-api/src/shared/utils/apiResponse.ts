import { Response } from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// Standardised API response wrapper
// All routes must use these helpers — never call res.json() directly
// ─────────────────────────────────────────────────────────────────────────────

export function success<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

export function created<T>(res: Response, data: T, message?: string): Response {
  return success(res, data, message, 201);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function error(
  res: Response,
  code: string,
  message: string,
  details?: unknown,
  statusCode = 400,
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  });
}

export function unauthorized(res: Response, message = 'Unauthorized'): Response {
  return error(res, 'UNAUTHORIZED', message, undefined, 401);
}

export function forbidden(res: Response, message = 'Forbidden'): Response {
  return error(res, 'FORBIDDEN', message, undefined, 403);
}

export function notFound(res: Response, resource = 'Resource'): Response {
  return error(res, 'NOT_FOUND', `${resource} not found`, undefined, 404);
}

export function conflict(res: Response, message: string): Response {
  return error(res, 'CONFLICT', message, undefined, 409);
}

export function tooManyRequests(res: Response, retryAfter: number): Response {
  res.setHeader('Retry-After', retryAfter);
  return error(res, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please slow down.', { retryAfter }, 429);
}

export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
): Response {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
