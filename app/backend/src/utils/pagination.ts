import { PAGINATION_DEFAULT } from '../config/constants';

export interface PaginationParams {
  page: number;
  perPage: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export function parsePagination(query: { page?: string; perPage?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '') || PAGINATION_DEFAULT.page);
  const perPage = Math.min(
    PAGINATION_DEFAULT.maxPerPage,
    Math.max(1, parseInt(query.perPage || '') || PAGINATION_DEFAULT.perPage)
  );
  return { page, perPage, skip: (page - 1) * perPage };
}

export function paginate<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  return {
    data,
    meta: {
      total,
      page: params.page,
      perPage: params.perPage,
      totalPages: Math.ceil(total / params.perPage),
    },
  };
}
