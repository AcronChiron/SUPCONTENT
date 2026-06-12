import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { PaginationParams } from '../utils/pagination';
import { MediaType, LibraryStatus } from '@prisma/client';
import { getIo } from '../config/socket';

export async function getLibrary(userId: string, pagination: PaginationParams, filters?: { status?: string; mediaType?: string }) {
  const where: any = { userId };
  if (filters?.status) where.status = filters.status;
  if (filters?.mediaType) where.mediaType = filters.mediaType;

  const [items, total] = await Promise.all([
    prisma.libraryItem.findMany({ where, skip: pagination.skip, take: pagination.perPage, orderBy: { updatedAt: 'desc' } }),
    prisma.libraryItem.count({ where }),
  ]);

  const ids = items.map(i => i.externalId);
  const caches = ids.length
    ? await prisma.mediaCache.findMany({ where: { externalId: { in: ids } } })
    : [];
  const cacheMap = new Map(caches.map(c => [c.externalId, c]));
  const data = items.map(i => {
    const c = cacheMap.get(i.externalId);
    return { ...i, title: c?.title || null, artistName: c?.artistName || null, imageUrl: c?.imageUrl || null };
  });
  return { data, total };
}

export async function upsertItem(userId: string, data: {
  externalId: string; mediaType: MediaType; status: LibraryStatus;
  rating?: number; notes?: string; title?: string; artistName?: string; imageUrl?: string;
}) {
  const { title, artistName, imageUrl, ...itemData } = data;
  if (title) {
    await prisma.mediaCache.upsert({
      where: { externalId: data.externalId },
      create: { externalId: data.externalId, mediaType: data.mediaType, title, artistName, imageUrl },
      update: { title, artistName, imageUrl },
    });
  }
  const item = await prisma.libraryItem.upsert({
    where: { userId_externalId: { userId, externalId: data.externalId } },
    create: { userId, ...itemData },
    update: { status: itemData.status, rating: itemData.rating, notes: itemData.notes },
  });

  // Emit feed:activity to followers only when status is DONE (non-blocking)
  if (data.status === LibraryStatus.DONE) {
    try {
      const followers = await prisma.follow.findMany({
        where: { followedId: userId },
        select: { followerId: true },
      });
      const io = getIo();
      if (io && followers.length > 0) {
        const activity = {
          type: 'library',
          userId,
          externalId: data.externalId,
          mediaType: data.mediaType,
          status: data.status,
          title: title ?? null,
        };
        for (const { followerId } of followers) {
          io.to(`user:${followerId}`).emit('feed:activity', activity);
        }
      }
    } catch (err) {
      console.error('[WebSocket] Failed to emit feed:activity for library', err);
    }
  }

  return item;
}

export async function getStats(userId: string) {
  const [byStatus, byType, avgRating] = await Promise.all([
    prisma.libraryItem.groupBy({ by: ['status'], where: { userId }, _count: true }),
    prisma.libraryItem.groupBy({ by: ['mediaType'], where: { userId }, _count: true }),
    prisma.libraryItem.aggregate({ where: { userId, rating: { not: null } }, _avg: { rating: true } }),
  ]);
  return { byStatus, byType, avgRating: avgRating._avg.rating };
}

export async function deleteItem(userId: string, itemId: string) {
  const item = await prisma.libraryItem.findFirst({ where: { id: itemId, userId } });
  if (!item) throw ApiError.notFound('Library item not found');
  await prisma.libraryItem.delete({ where: { id: itemId } });
}
