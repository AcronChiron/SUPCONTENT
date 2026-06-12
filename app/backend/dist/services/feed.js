"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeed = getFeed;
exports.getDiscover = getDiscover;
const database_1 = require("../config/database");
async function getFeed(userId, pagination) {
    // Get IDs of users we follow
    const following = await database_1.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followedId: true },
    });
    const followedIds = following.map(f => f.followedId);
    if (followedIds.length === 0)
        return { data: [], total: 0 };
    const [data, total] = await Promise.all([
        database_1.prisma.review.findMany({
            where: { userId: { in: followedIds } },
            skip: pagination.skip,
            take: pagination.perPage,
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.review.count({ where: { userId: { in: followedIds } } }),
    ]);
    return { data, total };
}
async function getDiscover(pagination) {
    const [data, total] = await Promise.all([
        database_1.prisma.review.findMany({
            skip: pagination.skip,
            take: pagination.perPage,
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        }),
        database_1.prisma.review.count(),
    ]);
    return { data, total };
}
//# sourceMappingURL=feed.js.map