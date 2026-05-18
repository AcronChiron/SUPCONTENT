import { Router } from 'express';
import * as notifCtrl from '../controllers/notification';
import { authenticate } from '../middlewares/auth';

export const notificationRouter = Router();
notificationRouter.use(authenticate);

notificationRouter.get('/', notifCtrl.getNotifications);
notificationRouter.patch('/read-all', notifCtrl.markAllRead);
notificationRouter.get('/preferences', notifCtrl.getPrefs);
notificationRouter.patch('/preferences', notifCtrl.updatePrefs);
notificationRouter.patch('/:id/read', notifCtrl.markRead);
