import { prisma } from '../config/database';
import { PaginationParams } from '../utils/pagination';

export async function getNotifications(userId: string, pagination: PaginationParams) {
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip: pagination.skip, take: pagination.perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { data, total };
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function markRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { isRead: true } });
}

export async function createNotification(userId: string, type: string, payload: any) {
  return prisma.notification.create({ data: { userId, type, payload } });
}
