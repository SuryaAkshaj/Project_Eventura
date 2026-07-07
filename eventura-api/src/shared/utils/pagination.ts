import { Request } from 'express';
import { AppError } from '@shared/errors/AppError';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function getPagination(query: Request['query']): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const requestedLimit = parseInt(query.limit as string) || DEFAULT_PAGE_SIZE;

  if (requestedLimit > MAX_PAGE_SIZE) {
    throw new AppError(
      'PAGINATION_LIMIT_EXCEEDED',
      `Maximum page size is ${MAX_PAGE_SIZE}. Got: ${requestedLimit}`,
      400
    );
  }

  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedLimit));

  return { page, limit, skip: (page - 1) * limit };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
