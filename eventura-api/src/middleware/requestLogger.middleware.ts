import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@shared/utils/logger';

// Attach a unique request ID to every request
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  (req as Request & { requestId: string }).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

// Morgan HTTP request logger
export const requestLogger = morgan(
  (tokens, req: Request & { requestId?: string }, res) => {
    return [
      `[${req.requestId ?? '-'}]`,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      `${tokens['response-time'](req, res)}ms`,
      tokens.res(req, res, 'content-length') ? `${tokens.res(req, res, 'content-length')}b` : '-',
    ].join(' ');
  },
  {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
    skip: (req) => req.path === '/health', // Skip health check logs
  },
);
