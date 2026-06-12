import { Router } from 'express';
import * as libraryCtrl from '../controllers/library';
import { authenticate } from '../middlewares/auth';

export const libraryRouter = Router();
libraryRouter.use(authenticate);

libraryRouter.get('/', libraryCtrl.getLibrary);
libraryRouter.put('/', libraryCtrl.upsertItem);
libraryRouter.get('/stats', libraryCtrl.getStats);
libraryRouter.delete('/:itemId', libraryCtrl.deleteItem);
