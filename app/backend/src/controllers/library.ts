import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as libraryService from '../services/library';

const upsertSchema = z.object({
  externalId: z.string(),
  mediaType: z.enum(['ARTIST', 'ALBUM', 'TRACK']),
  status: z.enum(['TO_LISTEN', 'LISTENING', 'DONE', 'ABANDONED']),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
  title: z.string().optional(),
  artistName: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const getLibrary = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { status, mediaType } = req.query as any;
  const { data, total } = await libraryService.getLibrary(req.user!.userId, pagination, { status, mediaType });
  res.json(paginate(data, total, pagination));
});

export const upsertItem = asyncHandler(async (req: Request, res: Response) => {
  const data = upsertSchema.parse(req.body);
  const item = await libraryService.upsertItem(req.user!.userId, data);
  res.json(item);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await libraryService.getStats(req.user!.userId);
  res.json(stats);
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  await libraryService.deleteItem(req.user!.userId, req.params.itemId);
  res.json({ message: 'Deleted' });
});
