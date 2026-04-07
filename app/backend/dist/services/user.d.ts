import { PaginationParams } from '../utils/pagination';
export declare function getMe(userId: string): Promise<{
    followersCount: number;
    followingCount: number;
    role: import(".prisma/client").$Enums.Role;
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    websiteUrl: string | null;
    theme: string;
    language: string;
    createdAt: Date;
}>;
export declare function updateMe(userId: string, data: {
    bio?: string;
    avatarUrl?: string;
    websiteUrl?: string;
    theme?: string;
    language?: string;
}): Promise<{
    role: import(".prisma/client").$Enums.Role;
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    websiteUrl: string | null;
    theme: string;
    language: string;
    createdAt: Date;
}>;
export declare function getByUsername(username: string): Promise<{
    followersCount: number;
    followingCount: number;
    reviewsCount: number;
    role: import(".prisma/client").$Enums.Role;
    id: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    websiteUrl: string | null;
    isBanned: boolean;
    createdAt: Date;
}>;
export declare function getFollowers(username: string, pagination: PaginationParams): Promise<{
    data: {
        role: import(".prisma/client").$Enums.Role;
        id: string;
        username: string;
        avatarUrl: string | null;
        bio: string | null;
        websiteUrl: string | null;
        createdAt: Date;
    }[];
    total: number;
}>;
export declare function getFollowing(username: string, pagination: PaginationParams): Promise<{
    data: {
        role: import(".prisma/client").$Enums.Role;
        id: string;
        username: string;
        avatarUrl: string | null;
        bio: string | null;
        websiteUrl: string | null;
        createdAt: Date;
    }[];
    total: number;
}>;
export declare function followUser(followerId: string, username: string): Promise<{
    followed: boolean;
}>;
export declare function unfollowUser(followerId: string, username: string): Promise<{
    followed: boolean;
}>;
//# sourceMappingURL=user.d.ts.map