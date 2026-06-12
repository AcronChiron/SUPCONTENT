import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as feedService from '../services/feed';

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await feedService.getFeed(req.user!.userId, pagination);
  res.json(paginate(data, total, pagination));
});

export const getDiscover = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await feedService.getDiscover(pagination);
  res.json(paginate(data, total, pagination));
});
