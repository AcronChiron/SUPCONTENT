import { PaginationParams } from '../utils/pagination';
export declare function getReports(pagination: PaginationParams, status?: string): Promise<{
    data: ({
        review: {
            userId: string;
            id: string;
            content: string;
        };
        reporter: {
            id: string;
            username: string;
        };
    } & {
        status: string;
        id: string;
        createdAt: Date;
        reviewId: string;
        reason: string;
        details: string | null;
        resolvedAt: Date | null;
        reporterId: string;
    })[];
    total: number;
}>;
export declare function resolveReport(reportId: string, status: string): Promise<{
    status: string;
    id: string;
    createdAt: Date;
    reviewId: string;
    reason: string;
    details: string | null;
    resolvedAt: Date | null;
    reporterId: string;
}>;
export declare function featureReview(reviewId: string, featured: boolean): Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    externalId: string;
    rating: number;
    mediaType: import(".prisma/client").$Enums.MediaType;
    content: string;
    containsSpoiler: boolean;
    isFeatured: boolean;
}>;
export declare function banUser(username: string): Promise<{
    role: import(".prisma/client").$Enums.Role;
    id: string;
    email: string;
    username: string;
    passwordHash: string | null;
    avatarUrl: string | null;
    bio: string | null;
    websiteUrl: string | null;
    theme: string;
    language: string;
    isBanned: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function unbanUser(username: string): Promise<{
    role: import(".prisma/client").$Enums.Role;
    id: string;
    email: string;
    username: string;
    passwordHash: string | null;
    avatarUrl: string | null;
    bio: string | null;
    websiteUrl: string | null;
    theme: string;
    language: string;
    isBanned: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=admin.d.ts.map