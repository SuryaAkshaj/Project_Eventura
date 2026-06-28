export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: any;

  constructor(code: string, message: string, status: number = 400, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError('NOT_FOUND', message, 404);
  }

  static forbidden(message: string = 'Access denied') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static badRequest(message: string, details?: any) {
    return new AppError('BAD_REQUEST', message, 400, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static conflict(message: string) {
    return new AppError('CONFLICT', message, 409);
  }

  static tooManyRequests(message: string) {
    return new AppError('TOO_MANY_REQUESTS', message, 429);
  }
}
