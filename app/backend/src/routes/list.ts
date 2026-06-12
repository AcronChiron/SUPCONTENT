import { Router } from 'express';
import * as listCtrl from '../controllers/list';
import { authenticate, optionalAuth } from '../middlewares/auth';

export const listRouter = Router();

listRouter.get('/', authenticate, listCtrl.getLists);
listRouter.post('/', authenticate, listCtrl.createList);
listRouter.get('/:listId', optionalAuth, listCtrl.getList);
listRouter.patch('/:listId', authenticate, listCtrl.updateList);
listRouter.delete('/:listId', authenticate, listCtrl.deleteList);
listRouter.post('/:listId/items', authenticate, listCtrl.addItem);
listRouter.delete('/:listId/items/:externalId', authenticate, listCtrl.removeItem);
