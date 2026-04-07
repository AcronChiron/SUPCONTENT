import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as notifService from '../services/notification';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await notifService.getNotifications(req.user!.userId, pagination);
  res.json(paginate(data, total, pagination));
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notifService.markAllRead(req.user!.userId);
  res.json({ message: 'All notifications marked as read' });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await notifService.markRead(req.user!.userId, req.params.id);
  res.json({ message: 'Notification marked as read' });
});
