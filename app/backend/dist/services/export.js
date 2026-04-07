"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportUserData = exportUserData;
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const ApiError_1 = require("../utils/ApiError");
async function exportUserData(userId, format) {
    // Rate limit: 1 export per 24h
    const key = `export:${userId}`;
    const last = await redis_1.redis.get(key);
    if (last)
        throw ApiError_1.ApiError.tooMany('Export available once per 24 hours');
    const [user, library, reviews, messages, lists] = await Promise.all([
        database_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true, bio: true, createdAt: true } }),
        database_1.prisma.libraryItem.findMany({ where: { userId } }),
        database_1.prisma.review.findMany({ where: { userId } }),
        database_1.prisma.message.findMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
        database_1.prisma.customList.findMany({ where: { userId }, include: { items: true } }),
    ]);
    await redis_1.redis.setex(key, 86400, '1');
    const data = { user, library, reviews, messages, lists, exportedAt: new Date().toISOString() };
    if (format === 'csv') {
        return { format: 'csv', content: jsonToCsv(data) };
    }
    return { format: 'json', content: data };
}
function jsonToCsv(data) {
    const sections = [];
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0) {
            const headers = Object.keys(value[0]);
            const rows = value.map((item) => headers.map(h => JSON.stringify(item[h] ?? '')).join(','));
            sections.push(`--- ${key} ---\n${headers.join(',')}\n${rows.join('\n')}`);
        }
    }
    return sections.join('\n\n');
}
//# sourceMappingURL=export.js.map