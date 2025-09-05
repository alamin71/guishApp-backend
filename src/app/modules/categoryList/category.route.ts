import express from 'express';
import upload from '../../middleware/fileUpload';
import {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from './category.controller';

const router = express.Router();

// ✅ Create Category (max 3 images)
router.post('/createCategory', upload.array('images', 3), createCategory);

// ✅ Get All Categories
router.get('/', getAllCategories);

// ✅ Get Single Category by ID
router.get('/:id', getSingleCategory);

// ✅ Update Category (max 3 images)
router.patch('/:id', upload.array('images', 3), updateCategory);

// ✅ Delete Category by ID
router.delete('/:id', deleteCategory);

export const CategoryRoutes = router;
