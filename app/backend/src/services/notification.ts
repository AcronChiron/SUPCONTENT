import { prisma } from '../config/database';
import { PaginationParams } from '../utils/pagination';
import { getIo } from '../config/socket';

type NotificationType = 'like' | 'comment' | 'follow' | 'new_release';

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

const DEFAULT_PREFS = { likes: true, comments: true, follows: true, new_release: true };

export async function getPrefs(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { notificationPrefs: true } });
  return (user?.notificationPrefs as typeof DEFAULT_PREFS | null) ?? DEFAULT_PREFS;
}

export async function updatePrefs(userId: string, prefs: Partial<typeof DEFAULT_PREFS>) {
  const current = await getPrefs(userId);
  const updated = { ...current, ...prefs };
  await prisma.user.update({ where: { id: userId }, data: { notificationPrefs: updated } });
  return updated;
}

export async function createNotification(userId: string, type: NotificationType, payload: object) {
  const prefs = await getPrefs(userId);
  const prefKeyMap: Record<NotificationType, keyof typeof DEFAULT_PREFS> = {
    like: 'likes',
    comment: 'comments',
    follow: 'follows',
    new_release: 'new_release',
  };
  const prefKey = prefKeyMap[type];
  if (prefs[prefKey] === false) return null;

  const notif = await prisma.notification.create({ data: { userId, type, payload } });
  const io = getIo();
  if (io) {
    try {
      io.to(`user:${userId}`).emit('notification:new', notif);
    } catch (err) {
      console.error('[WebSocket] Failed to emit notification:new', err);
    }
  }
  return notif;
}
