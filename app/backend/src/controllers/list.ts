import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as listService from '../services/list';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

const addItemSchema = z.object({
  externalId: z.string(),
  mediaType: z.enum(['ARTIST', 'ALBUM', 'TRACK']),
});

export const getLists = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await listService.getLists(req.user!.userId, pagination);
  res.json(paginate(data, total, pagination));
});

export const createList = asyncHandler(async (req: Request, res: Response) => {
  const data = createSchema.parse(req.body);
  const list = await listService.createList(req.user!.userId, data);
  res.status(201).json(list);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const list = await listService.getList(req.params.listId, req.user?.userId);
  res.json(list);
});

export const updateList = asyncHandler(async (req: Request, res: Response) => {
  const data = createSchema.partial().parse(req.body);
  const list = await listService.updateList(req.user!.userId, req.params.listId, data);
  res.json(list);
});

export const deleteList = asyncHandler(async (req: Request, res: Response) => {
  await listService.deleteList(req.user!.userId, req.params.listId);
  res.json({ message: 'Deleted' });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const data = addItemSchema.parse(req.body);
  const item = await listService.addItem(req.user!.userId, req.params.listId, data);
  res.status(201).json(item);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  await listService.removeItem(req.user!.userId, req.params.listId, req.params.externalId);
  res.json({ message: 'Removed' });
});
