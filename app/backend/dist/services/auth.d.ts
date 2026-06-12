export declare function generateTokens(userId: string, role: string): {
    accessToken: string;
    refreshToken: string;
};
export declare function registerUser(email: string, username: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        role: import(".prisma/client").$Enums.Role;
        id: string;
        email: string;
        username: string;
        avatarUrl: string | null;
        createdAt: Date;
    };
}>;
export declare function loginUser(email: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
    };
}>;
export declare function refreshTokens(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function findOrCreateOAuthUser(provider: string, profile: {
    email: string;
    name: string;
    avatarUrl?: string;
}): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
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
    };
}>;
//# sourceMappingURL=auth.d.ts.map