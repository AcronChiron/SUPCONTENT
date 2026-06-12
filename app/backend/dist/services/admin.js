"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = getReports;
exports.resolveReport = resolveReport;
exports.featureReview = featureReview;
exports.banUser = banUser;
exports.unbanUser = unbanUser;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
async function getReports(pagination, status) {
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
        database_1.prisma.report.findMany({
            where, skip: pagination.skip, take: pagination.perPage,
            include: {
                reporter: { select: { id: true, username: true } },
                review: { select: { id: true, content: true, userId: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.report.count({ where }),
    ]);
    return { data, total };
}
async function resolveReport(reportId, status) {
    const report = await database_1.prisma.report.findUnique({ where: { id: reportId } });
    if (!report)
        throw ApiError_1.ApiError.notFound('Report not found');
    return database_1.prisma.report.update({ where: { id: reportId }, data: { status, resolvedAt: new Date() } });
}
async function featureReview(reviewId, featured) {
    const review = await database_1.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    return database_1.prisma.review.update({ where: { id: reviewId }, data: { isFeatured: featured } });
}
async function banUser(username) {
    const user = await database_1.prisma.user.findUnique({ where: { username } });
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    return database_1.prisma.user.update({ where: { username }, data: { isBanned: true } });
}
async function unbanUser(username) {
    const user = await database_1.prisma.user.findUnique({ where: { username } });
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    return database_1.prisma.user.update({ where: { username }, data: { isBanned: false } });
}
//# sourceMappingURL=admin.js.map