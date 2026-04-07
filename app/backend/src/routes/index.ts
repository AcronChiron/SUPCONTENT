import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { musicRouter } from './music';
import { libraryRouter } from './library';
import { listRouter } from './list';
import { reviewRouter } from './review';
import { feedRouter } from './feed';
import { messageRouter } from './message';
import { notificationRouter } from './notification';
import { adminRouter } from './admin';
import { exportRouter } from './export';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/music', musicRouter);
apiRouter.use('/library', libraryRouter);
apiRouter.use('/lists', listRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/feed', feedRouter);
apiRouter.use('/messages', messageRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/export', exportRouter);
