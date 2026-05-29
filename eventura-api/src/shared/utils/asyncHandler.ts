import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to automatically catch errors and pass to next().
 * Eliminates the need for try-catch blocks in every controller.
 *
 * Usage:
 *   router.get('/events', asyncHandler(async (req, res) => {
 *     const events = await prisma.event.findMany();
 *     return success(res, events);
 *   }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
