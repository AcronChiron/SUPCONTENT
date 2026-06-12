import { PaginationParams } from '../utils/pagination';
import { MediaType, LibraryStatus } from '@prisma/client';
export declare function getLibrary(userId: string, pagination: PaginationParams, filters?: {
    status?: string;
    mediaType?: string;
}): Promise<{
    data: {
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
    total: number;
}>;
export declare function upsertItem(userId: string, data: {
    externalId: string;
    mediaType: MediaType;
    status: LibraryStatus;
    rating?: number;
    notes?: string;
}): Promise<{
    status: import(".prisma/client").$Enums.LibraryStatus;
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    externalId: string;
    rating: number | null;
    mediaType: import(".prisma/client").$Enums.MediaType;
    notes: string | null;
}>;
export declare function getStats(userId: string): Promise<{
    byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LibraryItemGroupByOutputType, "status"[]> & {
        _count: number;
    })[];
    byType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.LibraryItemGroupByOutputType, "mediaType"[]> & {
        _count: number;
    })[];
    avgRating: number | null;
}>;
export declare function deleteItem(userId: string, itemId: string): Promise<void>;
//# sourceMappingURL=library.d.ts.map