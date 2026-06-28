export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
}

export interface EventQuery extends SearchQuery {
  category?: string;
  format?: string;
  isFree?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'startDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export interface CollegeQuery extends SearchQuery {
  status?: string;
}

export interface UserQuery extends SearchQuery {
  role?: string;
}

export interface AuditQuery extends PaginationQuery {
  action?: string;
}
