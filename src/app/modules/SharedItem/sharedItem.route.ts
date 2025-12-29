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

router.post('/share', shareItem);            
router.patch('/move', moveItemToCategory);   
router.get('/all', getAllSharedItems);       
router.get('/category/:categoryId', getItemsByCategory); 
router.delete('/:itemId', deleteItem); 

export const SharedItemRoutes = router;
