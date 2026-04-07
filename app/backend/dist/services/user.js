"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
exports.updateMe = updateMe;
exports.getByUsername = getByUsername;
exports.getFollowers = getFollowers;
exports.getFollowing = getFollowing;
exports.followUser = followUser;
exports.unfollowUser = unfollowUser;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
const userSelect = {
    id: true, email: true, username: true, role: true,
    avatarUrl: true, bio: true, websiteUrl: true, theme: true,
    language: true, createdAt: true,
};
const publicUserSelect = {
    id: true, username: true, role: true, avatarUrl: true,
    bio: true, websiteUrl: true, createdAt: true,
};
async function getMe(userId) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    const [followersCount, followingCount] = await Promise.all([
        database_1.prisma.follow.count({ where: { followedId: userId } }),
        database_1.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { ...user, followersCount, followingCount };
}
async function updateMe(userId, data) {
    return database_1.prisma.user.update({ where: { id: userId }, data, select: userSelect });
}
async function getByUsername(username) {
    const user = await database_1.prisma.user.findUnique({ where: { username }, select: { ...publicUserSelect, id: true, isBanned: true } });
    if (!user || user.isBanned)
        throw ApiError_1.ApiError.notFound('User not found');
    const [followersCount, followingCount, reviewsCount] = await Promise.all([
        database_1.prisma.follow.count({ where: { followedId: user.id } }),
        database_1.prisma.follow.count({ where: { followerId: user.id } }),
        database_1.prisma.review.count({ where: { userId: user.id } }),
    ]);
    return { ...user, followersCount, followingCount, reviewsCount };
}
async function getFollowers(username, pagination) {
    const user = await database_1.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    const [data, total] = await Promise.all([
        database_1.prisma.follow.findMany({
            where: { followedId: user.id },
            skip: pagination.skip, take: pagination.perPage,
            include: { follower: { select: publicUserSelect } },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.follow.count({ where: { followedId: user.id } }),
    ]);
    return { data: data.map(f => f.follower), total };
}
async function getFollowing(username, pagination) {
    const user = await database_1.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    const [data, total] = await Promise.all([
        database_1.prisma.follow.findMany({
            where: { followerId: user.id },
            skip: pagination.skip, take: pagination.perPage,
            include: { followed: { select: publicUserSelect } },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.follow.count({ where: { followerId: user.id } }),
    ]);
    return { data: data.map(f => f.followed), total };
}
async function followUser(followerId, username) {
    const target = await database_1.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target)
        throw ApiError_1.ApiError.notFound('User not found');
    if (target.id === followerId)
        throw ApiError_1.ApiError.badRequest('Cannot follow yourself');
    try {
        await database_1.prisma.follow.create({ data: { followerId, followedId: target.id } });
    }
    catch {
        throw ApiError_1.ApiError.conflict('Already following this user');
    }
    return { followed: true };
}
async function unfollowUser(followerId, username) {
    const target = await database_1.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target)
        throw ApiError_1.ApiError.notFound('User not found');
    const deleted = await database_1.prisma.follow.deleteMany({
        where: { followerId, followedId: target.id },
    });
    if (deleted.count === 0)
        throw ApiError_1.ApiError.notFound('Not following this user');
    return { followed: false };
}
//# sourceMappingURL=user.js.map