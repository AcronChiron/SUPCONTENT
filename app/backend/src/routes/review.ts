import { Router } from 'express';
import * as reviewCtrl from '../controllers/review';
import { authenticate, optionalAuth } from '../middlewares/auth';

export const reviewRouter = Router();

reviewRouter.post('/', authenticate, reviewCtrl.create);
reviewRouter.get('/:reviewId', optionalAuth, reviewCtrl.get);
reviewRouter.patch('/:reviewId', authenticate, reviewCtrl.update);
reviewRouter.delete('/:reviewId', authenticate, reviewCtrl.remove);
reviewRouter.post('/:reviewId/like', authenticate, reviewCtrl.like);
reviewRouter.delete('/:reviewId/like', authenticate, reviewCtrl.unlike);
reviewRouter.get('/:reviewId/comments', reviewCtrl.getComments);
reviewRouter.post('/:reviewId/comments', authenticate, reviewCtrl.addComment);
reviewRouter.post('/:reviewId/report', authenticate, reviewCtrl.report);
