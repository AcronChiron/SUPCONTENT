import { PaginationParams } from '../utils/pagination';
export declare function getFeed(userId: string, pagination: PaginationParams): Promise<{
    data: ({
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
    })[];
    total: number;
}>;
export declare function getDiscover(pagination: PaginationParams): Promise<{
    data: ({
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
    })[];
    total: number;
}>;
//# sourceMappingURL=feed.d.ts.map