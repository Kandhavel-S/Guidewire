import { Response } from 'express';
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare function sendSuccess<T>(res: Response, data: T, statusCode?: number): void;
export declare function sendPaginated<T>(res: Response, data: T[], pagination: PaginationMeta): void;
export declare function sendError(res: Response, message: string, statusCode?: number, code?: string): void;
export declare function getPaginationParams(query: Record<string, unknown>): {
    page: number;
    limit: number;
    skip: number;
};
//# sourceMappingURL=response.d.ts.map