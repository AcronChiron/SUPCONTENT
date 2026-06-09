import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as userService from '../services/user';

const updateSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  theme: z.enum(['dark', 'light']).optional(),
  language: z.string().max(5).optional(),
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.userId);
  res.json(user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const data = updateSchema.parse(req.body);
  const user = await userService.updateMe(req.user!.userId, data);
  res.json(user);
});

export const getByUsername = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getByUsername(req.params.username, req.user?.userId);
  res.json(user);
});

export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await userService.getFollowers(req.params.username, pagination);
  res.json(paginate(data, total, pagination));
});

export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await userService.getFollowing(req.params.username, pagination);
  res.json(paginate(data, total, pagination));
});

export const follow = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.followUser(req.user!.userId, req.params.username);
  res.json(result);
});

export const unfollow = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.unfollowUser(req.user!.userId, req.params.username);
  res.json(result);
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteMe(req.user!.userId);
  res.status(204).send();
});

export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await userService.getUserReviews(req.params.username, pagination);
  res.json(paginate(data, total, pagination));
});
