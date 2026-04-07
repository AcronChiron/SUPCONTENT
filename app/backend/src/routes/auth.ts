import { Router } from 'express';
import * as authCtrl from '../controllers/auth';
import { authenticate } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post('/register', authCtrl.register);
authRouter.post('/login', authCtrl.login);
authRouter.post('/refresh', authCtrl.refresh);
authRouter.post('/logout', authenticate, authCtrl.logout);
authRouter.get('/oauth/google', authCtrl.oauthGoogle);
authRouter.get('/oauth/google/callback', authCtrl.oauthGoogleCallback);
authRouter.get('/oauth/github', authCtrl.oauthGithub);
authRouter.get('/oauth/github/callback', authCtrl.oauthGithubCallback);
