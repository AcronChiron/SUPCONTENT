import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as reviewService from '../services/review';

const createSchema = z.object({
  externalId: z.string(),
  mediaType: z.enum(['ARTIST', 'ALBUM', 'TRACK']),
  content: z.string().min(10).max(5000),
  rating: z.number().min(1).max(5),
  containsSpoiler: z.boolean().optional(),
  title: z.string().optional(),
  artistName: z.string().optional(),
  imageUrl: z.string().optional(),
});

const updateSchema = z.object({
  content: z.string().min(10).max(5000).optional(),
  rating: z.number().min(1).max(5).optional(),
  containsSpoiler: z.boolean().optional(),
});

const commentSchema = z.object({ content: z.string().min(1).max(2000) });
const reportSchema = z.object({ reason: z.string().min(1), details: z.string().optional() });

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = createSchema.parse(req.body);
  const review = await reviewService.createReview(req.user!.userId, data);
  res.status(201).json(review);
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.getReview(req.params.reviewId, req.user?.userId);
  res.json(review);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = updateSchema.parse(req.body);
  const review = await reviewService.updateReview(req.user!.userId, req.params.reviewId, data);
  res.json(review);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.user!.userId, req.params.reviewId);
  res.json({ message: 'Deleted' });
});

export const like = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.likeReview(req.user!.userId, req.params.reviewId);
  res.json({ liked: true });
});

export const unlike = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.unlikeReview(req.user!.userId, req.params.reviewId);
  res.json({ liked: false });
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await reviewService.getComments(req.params.reviewId, pagination.skip, pagination.perPage);
  res.json(paginate(data, total, pagination));
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { content } = commentSchema.parse(req.body);
  const comment = await reviewService.addComment(req.user!.userId, req.params.reviewId, content);
  res.status(201).json(comment);
});

export const report = asyncHandler(async (req: Request, res: Response) => {
  const { reason, details } = reportSchema.parse(req.body);
  const rpt = await reviewService.reportReview(req.user!.userId, req.params.reviewId, reason, details);
  res.status(201).json(rpt);
});
