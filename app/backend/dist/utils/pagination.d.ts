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
export declare function parsePagination(query: {
    page?: string;
    perPage?: string;
}): PaginationParams;
export declare function paginate<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T>;
//# sourceMappingURL=pagination.d.ts.map