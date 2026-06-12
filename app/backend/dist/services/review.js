"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.getReview = getReview;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
exports.likeReview = likeReview;
exports.unlikeReview = unlikeReview;
exports.getComments = getComments;
exports.addComment = addComment;
exports.reportReview = reportReview;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
async function createReview(userId, data) {
    try {
        return await database_1.prisma.review.create({
            data: { userId, ...data },
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        });
    }
    catch {
        throw ApiError_1.ApiError.conflict('You already reviewed this');
    }
}
async function getReview(reviewId) {
    const review = await database_1.prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { likes: true, comments: true } },
        },
    });
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    return review;
}
async function updateReview(userId, reviewId, data) {
    const review = await database_1.prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    return database_1.prisma.review.update({ where: { id: reviewId }, data });
}
async function deleteReview(userId, reviewId) {
    const review = await database_1.prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    await database_1.prisma.review.delete({ where: { id: reviewId } });
}
async function likeReview(userId, reviewId) {
    const review = await database_1.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    try {
        await database_1.prisma.like.create({ data: { userId, reviewId } });
    }
    catch {
        throw ApiError_1.ApiError.conflict('Already liked');
    }
}
async function unlikeReview(userId, reviewId) {
    const deleted = await database_1.prisma.like.deleteMany({ where: { userId, reviewId } });
    if (deleted.count === 0)
        throw ApiError_1.ApiError.notFound('Like not found');
}
async function getComments(reviewId, skip, take) {
    const [data, total] = await Promise.all([
        database_1.prisma.comment.findMany({
            where: { reviewId }, skip, take,
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        database_1.prisma.comment.count({ where: { reviewId } }),
    ]);
    return { data, total };
}
async function addComment(userId, reviewId, content) {
    const review = await database_1.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    return database_1.prisma.comment.create({
        data: { userId, reviewId, content },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    });
}
async function reportReview(reporterId, reviewId, reason, details) {
    const review = await database_1.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    return database_1.prisma.report.create({ data: { reporterId, reviewId, reason, details } });
}
//# sourceMappingURL=review.js.map