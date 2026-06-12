import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as exportService from '../services/export';

export const exportMyData = asyncHandler(async (req: Request, res: Response) => {
  const format = (req.query.format as string) === 'csv' ? 'csv' : 'json';
  const result = await exportService.exportUserData(req.user!.userId, format);

  if (result.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=my-data.csv');
    res.send(result.content);
  } else {
    res.setHeader('Content-Disposition', 'attachment; filename=my-data.json');
    res.json(result.content);
  }
});
