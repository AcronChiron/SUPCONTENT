import { Router } from 'express';
import * as messageCtrl from '../controllers/message';
import { authenticate } from '../middlewares/auth';

export const messageRouter = Router();
messageRouter.use(authenticate);

messageRouter.get('/conversations', messageCtrl.getConversations);
messageRouter.get('/conversations/:username', messageCtrl.getMessages);
messageRouter.post('/conversations/:username', messageCtrl.sendMessage);
