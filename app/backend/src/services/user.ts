import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { PaginationParams } from '../utils/pagination';

const userSelect = {
  id: true, email: true, username: true, role: true,
  avatarUrl: true, bio: true, websiteUrl: true, theme: true,
  language: true, createdAt: true,
};

const publicUserSelect = {
  id: true, username: true, role: true, avatarUrl: true,
  bio: true, websiteUrl: true, createdAt: true,
};

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  if (!user) throw ApiError.notFound('User not found');
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followedId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { ...user, followersCount, followingCount };
}

export async function updateMe(userId: string, data: { bio?: string; avatarUrl?: string; websiteUrl?: string; theme?: string; language?: string }) {
  return prisma.user.update({ where: { id: userId }, data, select: userSelect });
}

export async function getByUsername(username: string, viewerId?: string) {
  const user = await prisma.user.findUnique({ where: { username }, select: { ...publicUserSelect, id: true, isBanned: true } });
  if (!user || user.isBanned) throw ApiError.notFound('User not found');
  const [followersCount, followingCount, reviewsCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followedId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.review.count({ where: { userId: user.id } }),
    viewerId && viewerId !== user.id
      ? prisma.follow.count({ where: { followerId: viewerId, followedId: user.id } }).then(c => c > 0)
      : Promise.resolve(false),
  ]);
  return { ...user, followersCount, followingCount, reviewsCount, isFollowing };
}

export async function getFollowers(username: string, pagination: PaginationParams) {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw ApiError.notFound('User not found');
  const [data, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followedId: user.id },
      skip: pagination.skip, take: pagination.perPage,
      include: { follower: { select: publicUserSelect } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where: { followedId: user.id } }),
  ]);
  return { data: data.map(f => f.follower), total };
}

export async function getFollowing(username: string, pagination: PaginationParams) {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw ApiError.notFound('User not found');
  const [data, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: user.id },
      skip: pagination.skip, take: pagination.perPage,
      include: { followed: { select: publicUserSelect } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where: { followerId: user.id } }),
  ]);
  return { data: data.map(f => f.followed), total };
}

export async function followUser(followerId: string, username: string) {
  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) throw ApiError.notFound('User not found');
  if (target.id === followerId) throw ApiError.badRequest('Cannot follow yourself');

  try {
    await prisma.follow.create({ data: { followerId, followedId: target.id } });
  } catch {
    throw ApiError.conflict('Already following this user');
  }
  return { followed: true };
}

export async function unfollowUser(followerId: string, username: string) {
  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) throw ApiError.notFound('User not found');
  const deleted = await prisma.follow.deleteMany({
    where: { followerId, followedId: target.id },
  });
  if (deleted.count === 0) throw ApiError.notFound('Not following this user');
  return { followed: false };
}
