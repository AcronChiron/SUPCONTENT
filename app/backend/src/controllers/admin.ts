import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as adminService from '../services/admin';

const resolveSchema = z.object({ status: z.enum(['RESOLVED', 'DISMISSED']) });
const featureSchema = z.object({ featured: z.boolean() });

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await adminService.getReports(pagination, req.query.status as string);
  res.json(paginate(data, total, pagination));
});

export const resolveReport = asyncHandler(async (req: Request, res: Response) => {
  const { status } = resolveSchema.parse(req.body);
  const report = await adminService.resolveReport(req.params.reportId, status);
  res.json(report);
});

export const featureReview = asyncHandler(async (req: Request, res: Response) => {
  const { featured } = featureSchema.parse(req.body);
  const review = await adminService.featureReview(req.params.reviewId, featured);
  res.json(review);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.getUserForAdmin(req.params.username);
  res.json(user);
});

export const banUser = asyncHandler(async (req: Request, res: Response) => {
  await adminService.banUser(req.params.username);
  res.json({ message: 'User banned' });
});

export const unbanUser = asyncHandler(async (req: Request, res: Response) => {
  await adminService.unbanUser(req.params.username);
  res.json({ message: 'User unbanned' });
});
