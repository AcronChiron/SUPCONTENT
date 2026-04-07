"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLibrary = getLibrary;
exports.upsertItem = upsertItem;
exports.getStats = getStats;
exports.deleteItem = deleteItem;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
async function getLibrary(userId, pagination, filters) {
    const where = { userId };
    if (filters?.status)
        where.status = filters.status;
    if (filters?.mediaType)
        where.mediaType = filters.mediaType;
    const [data, total] = await Promise.all([
        database_1.prisma.libraryItem.findMany({ where, skip: pagination.skip, take: pagination.perPage, orderBy: { updatedAt: 'desc' } }),
        database_1.prisma.libraryItem.count({ where }),
    ]);
    return { data, total };
}
async function upsertItem(userId, data) {
    return database_1.prisma.libraryItem.upsert({
        where: { userId_externalId: { userId, externalId: data.externalId } },
        create: { userId, ...data },
        update: { status: data.status, rating: data.rating, notes: data.notes },
    });
}
async function getStats(userId) {
    const [byStatus, byType, avgRating] = await Promise.all([
        database_1.prisma.libraryItem.groupBy({ by: ['status'], where: { userId }, _count: true }),
        database_1.prisma.libraryItem.groupBy({ by: ['mediaType'], where: { userId }, _count: true }),
        database_1.prisma.libraryItem.aggregate({ where: { userId, rating: { not: null } }, _avg: { rating: true } }),
    ]);
    return { byStatus, byType, avgRating: avgRating._avg.rating };
}
async function deleteItem(userId, itemId) {
    const item = await database_1.prisma.libraryItem.findFirst({ where: { id: itemId, userId } });
    if (!item)
        throw ApiError_1.ApiError.notFound('Library item not found');
    await database_1.prisma.libraryItem.delete({ where: { id: itemId } });
}
//# sourceMappingURL=library.js.map