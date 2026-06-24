import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { PaginationParams } from '../utils/pagination';

export async function getReports(pagination: PaginationParams, status?: string) {
  const where = status ? { status } : {};
  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where, skip: pagination.skip, take: pagination.perPage,
      include: {
        reporter: { select: { id: true, username: true } },
        review: { select: { id: true, content: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count({ where }),
  ]);
  return { data, total };
}

export async function resolveReport(reportId: string, status: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw ApiError.notFound('Report not found');
  return prisma.report.update({ where: { id: reportId }, data: { status, resolvedAt: new Date() } });
}

export async function featureReview(reviewId: string, featured: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound('Review not found');
  return prisma.review.update({ where: { id: reviewId }, data: { isFeatured: featured } });
}

export async function getUserForAdmin(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, email: true, role: true, isBanned: true, createdAt: true },
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function banUser(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw ApiError.notFound('User not found');
  return prisma.user.update({ where: { username }, data: { isBanned: true } });
}

export async function unbanUser(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw ApiError.notFound('User not found');
  return prisma.user.update({ where: { username }, data: { isBanned: false } });
}
