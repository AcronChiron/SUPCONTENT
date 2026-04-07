import { PaginationParams } from '../utils/pagination';
export declare function getNotifications(userId: string, pagination: PaginationParams): Promise<{
    data: {
        type: string;
        userId: string;
        id: string;
        createdAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue;
        isRead: boolean;
    }[];
    total: number;
}>;
export declare function markAllRead(userId: string): Promise<void>;
export declare function markRead(userId: string, notificationId: string): Promise<void>;
export declare function createNotification(userId: string, type: string, payload: any): Promise<{
    type: string;
    userId: string;
    id: string;
    createdAt: Date;
    payload: import("@prisma/client/runtime/library").JsonValue;
    isRead: boolean;
}>;
//# sourceMappingURL=notification.d.ts.map