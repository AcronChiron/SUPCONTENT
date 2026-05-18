import { Router } from 'express';
import * as userCtrl from '../controllers/user';
import { authenticate, optionalAuth } from '../middlewares/auth';

export const userRouter = Router();

userRouter.get('/me', authenticate, userCtrl.getMe);
userRouter.patch('/me', authenticate, userCtrl.updateMe);
userRouter.delete('/me', authenticate, userCtrl.deleteMe);
userRouter.get('/:username', optionalAuth, userCtrl.getByUsername);
userRouter.get('/:username/followers', userCtrl.getFollowers);
userRouter.get('/:username/following', userCtrl.getFollowing);
userRouter.post('/:username/follow', authenticate, userCtrl.follow);
userRouter.delete('/:username/follow', authenticate, userCtrl.unfollow);
