import { MediaType } from '@prisma/client';
export declare function createReview(userId: string, data: {
    externalId: string;
    mediaType: MediaType;
    content: string;
    rating: number;
    containsSpoiler?: boolean;
}): Promise<{
    user: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
} & {
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
export declare function getReview(reviewId: string): Promise<{
    user: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
    _count: {
        comments: number;
        likes: number;
    };
} & {
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
export declare function updateReview(userId: string, reviewId: string, data: {
    content?: string;
    rating?: number;
    containsSpoiler?: boolean;
}): Promise<{
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
export declare function deleteReview(userId: string, reviewId: string): Promise<void>;
export declare function likeReview(userId: string, reviewId: string): Promise<void>;
export declare function unlikeReview(userId: string, reviewId: string): Promise<void>;
export declare function getComments(reviewId: string, skip: number, take: number): Promise<{
    data: ({
        user: {
            id: string;
            username: string;
            avatarUrl: string | null;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        reviewId: string;
    })[];
    total: number;
}>;
export declare function addComment(userId: string, reviewId: string, content: string): Promise<{
    user: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
} & {
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    reviewId: string;
}>;
export declare function reportReview(reporterId: string, reviewId: string, reason: string, details?: string): Promise<{
    status: string;
    id: string;
    createdAt: Date;
    reviewId: string;
    reason: string;
    details: string | null;
    resolvedAt: Date | null;
    reporterId: string;
}>;
//# sourceMappingURL=review.d.ts.map