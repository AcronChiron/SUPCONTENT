export declare function getConversations(userId: string): Promise<any[]>;
export declare function getMessages(userId: string, partnerUsername: string, skip: number, take: number): Promise<{
    data: {
        id: string;
        createdAt: Date;
        content: string;
        senderId: string;
        receiverId: string;
        readAt: Date | null;
    }[];
    total: number;
}>;
export declare function sendMessage(senderId: string, partnerUsername: string, content: string): Promise<{
    id: string;
    createdAt: Date;
    content: string;
    senderId: string;
    receiverId: string;
    readAt: Date | null;
}>;
//# sourceMappingURL=message.d.ts.map