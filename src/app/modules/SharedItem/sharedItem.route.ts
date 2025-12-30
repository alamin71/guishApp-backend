import express from 'express';
import auth from '../../middleware/auth';
import {
  shareItem,
  moveItemToCategory,
  getAllSharedItems,
  getItemsByCategory,
} from './sharedItem.controller';

const router = express.Router();

router.use(auth('user', 'admin'));

router.post('/share', shareItem);
router.patch('/move', moveItemToCategory);
router.get('/all', getAllSharedItems);
router.get('/category/:categoryId', getItemsByCategory);

export const SharedItemRoutes = router;
