import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { MediaType } from '@prisma/client';
import { createNotification } from './notification';
import { getIo } from '../config/socket';

export async function createReview(userId: string, data: {
  externalId: string; mediaType: MediaType; content: string; rating: number;
  containsSpoiler?: boolean; title?: string; artistName?: string; imageUrl?: string;
}) {
  const { title, artistName, imageUrl, ...reviewData } = data;
  if (title) {
    await prisma.mediaCache.upsert({
      where: { externalId: data.externalId },
      create: { externalId: data.externalId, mediaType: data.mediaType, title, artistName, imageUrl },
      update: { title, artistName, imageUrl },
    });
  }
  let review;
  try {
    review = await prisma.review.create({
      data: { userId, ...reviewData },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    });
  } catch {
    throw ApiError.conflict('You already reviewed this');
  }

  // Emit feed:activity to followers (non-blocking)
  try {
    const followers = await prisma.follow.findMany({
      where: { followedId: userId },
      select: { followerId: true },
    });
    const io = getIo();
    if (io && followers.length > 0) {
      const activity = {
        type: 'review',
        userId,
        username: review.user.username,
        reviewId: review.id,
        externalId: data.externalId,
        mediaType: data.mediaType,
        rating: data.rating,
      };
      for (const { followerId } of followers) {
        io.to(`user:${followerId}`).emit('feed:activity', activity);
      }
    }
  } catch (err) {
    console.error('[WebSocket] Failed to emit feed:activity for review', err);
  }

  return review;
}

export async function getReview(reviewId: string, viewerId?: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!review) throw ApiError.notFound('Review not found');
  const [cache, likedCount] = await Promise.all([
    prisma.mediaCache.findUnique({ where: { externalId: review.externalId } }),
    viewerId ? prisma.like.count({ where: { reviewId, userId: viewerId } }) : Promise.resolve(0),
  ]);
  return {
    ...review,
    media: cache ? { title: cache.title, artistName: cache.artistName, imageUrl: cache.imageUrl, mediaType: cache.mediaType } : null,
    isLiked: likedCount > 0,
  };
}

export async function updateReview(userId: string, reviewId: string, data: { content?: string; rating?: number; containsSpoiler?: boolean }) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) throw ApiError.notFound('Review not found');
  return prisma.review.update({ where: { id: reviewId }, data });
}

export async function deleteReview(userId: string, reviewId: string) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) throw ApiError.notFound('Review not found');
  await prisma.review.delete({ where: { id: reviewId } });
}

export async function likeReview(userId: string, reviewId: string) {
  const [review, liker] = await Promise.all([
    prisma.review.findUnique({ where: { id: reviewId }, select: { id: true, userId: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { username: true } }),
  ]);
  if (!review) throw ApiError.notFound('Review not found');
  try {
    await prisma.like.create({ data: { userId, reviewId } });
  } catch {
    throw ApiError.conflict('Already liked');
  }
  if (review.userId !== userId) {
    try {
      await createNotification(review.userId, 'like', { reviewId, likerUserId: userId, likerUsername: liker?.username ?? '' });
    } catch (err) {
      console.error('[Notification] Failed to create like notification', err);
    }
  }
  return { liked: true };
}

export async function unlikeReview(userId: string, reviewId: string) {
  const deleted = await prisma.like.deleteMany({ where: { userId, reviewId } });
  if (deleted.count === 0) throw ApiError.notFound('Like not found');
}

export async function getComments(reviewId: string, skip: number, take: number) {
  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where: { reviewId }, skip, take,
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.comment.count({ where: { reviewId } }),
  ]);
  return { data, total };
}

export async function addComment(userId: string, reviewId: string, content: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true },
  });
  if (!review) throw ApiError.notFound('Review not found');
  const comment = await prisma.comment.create({
    data: { userId, reviewId, content },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });
  if (review.userId !== userId) {
    try {
      await createNotification(review.userId, 'comment', { reviewId, commenterUserId: userId, commenterUsername: comment.user.username });
    } catch (err) {
      console.error('[Notification] Failed to create comment notification', err);
    }
  }
  return comment;
}

export async function reportReview(reporterId: string, reviewId: string, reason: string, details?: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound('Review not found');
  return prisma.report.create({ data: { reporterId, reviewId, reason, details } });
}
