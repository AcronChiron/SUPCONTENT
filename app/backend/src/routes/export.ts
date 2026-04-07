import { Router } from 'express';
import * as exportCtrl from '../controllers/export';
import { authenticate } from '../middlewares/auth';

export const exportRouter = Router();

exportRouter.get('/my-data', authenticate, exportCtrl.exportMyData);
