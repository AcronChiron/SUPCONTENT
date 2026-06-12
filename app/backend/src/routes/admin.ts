import { Router } from 'express';
import * as adminCtrl from '../controllers/admin';
import { authenticate, requireAdmin } from '../middlewares/auth';

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/reports', adminCtrl.getReports);
adminRouter.patch('/reports/:reportId', adminCtrl.resolveReport);
adminRouter.patch('/reviews/:reviewId/feature', adminCtrl.featureReview);
adminRouter.post('/users/:username/ban', adminCtrl.banUser);
adminRouter.post('/users/:username/unban', adminCtrl.unbanUser);
