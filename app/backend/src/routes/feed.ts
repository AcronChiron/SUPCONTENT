import { Router } from 'express';
import * as feedCtrl from '../controllers/feed';
import { authenticate } from '../middlewares/auth';

export const feedRouter = Router();

feedRouter.get('/', authenticate, feedCtrl.getFeed);
feedRouter.get('/discover', feedCtrl.getDiscover);
