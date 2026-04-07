import { PaginationParams } from '../utils/pagination';
import { MediaType } from '@prisma/client';
export declare function getLists(userId: string, pagination: PaginationParams): Promise<{
    data: ({
        _count: {
            items: number;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isPublic: boolean;
    })[];
    total: number;
}>;
export declare function createList(userId: string, data: {
    name: string;
    description?: string;
    isPublic?: boolean;
}): Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    isPublic: boolean;
}>;
export declare function getList(listId: string, requesterId?: string): Promise<{
    user: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
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
}>;
export declare function updateList(userId: string, listId: string, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
}): Promise<{
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    isPublic: boolean;
}>;
export declare function deleteList(userId: string, listId: string): Promise<void>;
export declare function addItem(userId: string, listId: string, data: {
    externalId: string;
    mediaType: MediaType;
}): Promise<{
    id: string;
    createdAt: Date;
    externalId: string;
    mediaType: import(".prisma/client").$Enums.MediaType;
    position: number;
    listId: string;
}>;
export declare function removeItem(userId: string, listId: string, externalId: string): Promise<void>;
//# sourceMappingURL=list.d.ts.map