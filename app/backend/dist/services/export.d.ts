export declare function exportUserData(userId: string, format: 'json' | 'csv'): Promise<{
    format: string;
    content: string;
} | {
    format: string;
    content: {
        user: {
            id: string;
            email: string;
            username: string;
            bio: string | null;
            createdAt: Date;
        } | null;
        library: {
            status: import(".prisma/client").$Enums.LibraryStatus;
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            externalId: string;
            rating: number | null;
            mediaType: import(".prisma/client").$Enums.MediaType;
            notes: string | null;
        }[];
        reviews: {
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
        }[];
        messages: {
            id: string;
            createdAt: Date;
            content: string;
            senderId: string;
            receiverId: string;
            readAt: Date | null;
        }[];
        lists: ({
            items: {
                id: string;
                createdAt: Date;
                externalId: string;
                mediaType: import(".prisma/client").$Enums.MediaType;
                position: number;
                listId: string;
            }[];
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isPublic: boolean;
        })[];
        exportedAt: string;
    };
}>;
//# sourceMappingURL=export.d.ts.map