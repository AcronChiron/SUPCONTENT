import { prisma } from '../config/database';
import { PaginationParams } from '../utils/pagination';

async function attachMedia(reviews: any[]) {
  if (reviews.length === 0) return reviews;
  const ids = Array.from(new Set(reviews.map(r => r.externalId)));
  const caches = await prisma.mediaCache.findMany({ where: { externalId: { in: ids } } });
  const map = new Map(caches.map(c => [c.externalId, c]));
  return reviews.map(r => {
    const c = map.get(r.externalId);
    return { ...r, media: c ? { title: c.title, artistName: c.artistName, imageUrl: c.imageUrl, mediaType: c.mediaType } : null };
  });
}

export async function getFeed(userId: string, pagination: PaginationParams) {
  // Get IDs of users we follow
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followedId: true },
  });
  const followedIds = following.map(f => f.followedId);

  if (followedIds.length === 0) return { data: [], total: 0 };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId: { in: followedIds } },
      skip: pagination.skip,
      take: pagination.perPage,
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { userId: { in: followedIds } } }),
  ]);

  return { data: await attachMedia(reviews), total };
}

export async function getDiscover(pagination: PaginationParams) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      skip: pagination.skip,
      take: pagination.perPage,
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.review.count(),
  ]);
  return { data: await attachMedia(reviews), total };
}
