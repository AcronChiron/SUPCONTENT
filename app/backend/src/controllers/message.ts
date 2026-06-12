import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as messageService from '../services/message';

const sendSchema = z.object({ content: z.string().min(1).max(2000) });

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await messageService.getConversations(req.user!.userId);
  res.json({ data: conversations });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await messageService.getMessages(req.user!.userId, req.params.username, pagination.skip, pagination.perPage);
  res.json(paginate(data, total, pagination));
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content } = sendSchema.parse(req.body);
  const message = await messageService.sendMessage(req.user!.userId, req.params.username, content);
  res.status(201).json(message);
});
