"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversations = getConversations;
exports.getMessages = getMessages;
exports.sendMessage = sendMessage;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
async function checkMutualFollow(userId1, userId2) {
    const [a, b] = await Promise.all([
        database_1.prisma.follow.findUnique({ where: { followerId_followedId: { followerId: userId1, followedId: userId2 } } }),
        database_1.prisma.follow.findUnique({ where: { followerId_followedId: { followerId: userId2, followedId: userId1 } } }),
    ]);
    if (!a || !b)
        throw ApiError_1.ApiError.forbidden('Mutual follow required to send messages');
}
async function getConversations(userId) {
    // Get unique conversation partners
    const messages = await database_1.prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        orderBy: { createdAt: 'desc' },
        include: {
            sender: { select: { id: true, username: true, avatarUrl: true } },
            receiver: { select: { id: true, username: true, avatarUrl: true } },
        },
    });
    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (seen.has(partnerId))
            continue;
        seen.add(partnerId);
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        const unread = await database_1.prisma.message.count({ where: { senderId: partnerId, receiverId: userId, readAt: null } });
        conversations.push({ partner, lastMessage: msg, unreadCount: unread });
    }
    return conversations;
}
async function getMessages(userId, partnerUsername, skip, take) {
    const partner = await database_1.prisma.user.findUnique({ where: { username: partnerUsername }, select: { id: true } });
    if (!partner)
        throw ApiError_1.ApiError.notFound('User not found');
    const where = {
        OR: [
            { senderId: userId, receiverId: partner.id },
            { senderId: partner.id, receiverId: userId },
        ],
    };
    const [data, total] = await Promise.all([
        database_1.prisma.message.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        database_1.prisma.message.count({ where }),
    ]);
    // Mark unread messages as read
    await database_1.prisma.message.updateMany({
        where: { senderId: partner.id, receiverId: userId, readAt: null },
        data: { readAt: new Date() },
    });
    return { data: data.reverse(), total };
}
async function sendMessage(senderId, partnerUsername, content) {
    const partner = await database_1.prisma.user.findUnique({ where: { username: partnerUsername }, select: { id: true } });
    if (!partner)
        throw ApiError_1.ApiError.notFound('User not found');
    await checkMutualFollow(senderId, partner.id);
    return database_1.prisma.message.create({
        data: { senderId, receiverId: partner.id, content },
    });
}
//# sourceMappingURL=message.js.map