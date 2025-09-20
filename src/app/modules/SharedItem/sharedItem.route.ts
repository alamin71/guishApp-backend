import express from 'express';
import auth from '../../middleware/auth';
import {
  shareItem,
  moveItemToCategory,
  getAllSharedItems,
  getItemsByCategory,
  deleteItem,
} from './sharedItem.controller';

const router = express.Router();

router.use(auth('user', 'admin'));

router.post('/share', shareItem);            // Share item (AllShare default)
router.patch('/move', moveItemToCategory);   // Move to another category
router.get('/all', getAllSharedItems);       // AllShare items
router.get('/category/:categoryId', getItemsByCategory); // Items by category
router.delete('/:itemId', deleteItem); 

export const SharedItemRoutes = router;
