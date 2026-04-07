"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markAllRead = markAllRead;
exports.markRead = markRead;
exports.createNotification = createNotification;
const database_1 = require("../config/database");
async function getNotifications(userId, pagination) {
    const [data, total] = await Promise.all([
        database_1.prisma.notification.findMany({
            where: { userId },
            skip: pagination.skip, take: pagination.perPage,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total };
}
async function markAllRead(userId) {
    await database_1.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
async function markRead(userId, notificationId) {
    await database_1.prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { isRead: true } });
}
async function createNotification(userId, type, payload) {
    return database_1.prisma.notification.create({ data: { userId, type, payload } });
}
//# sourceMappingURL=notification.js.map