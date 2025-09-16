import express from 'express';
import upload from '../../middleware/fileUpload';
import auth from '../../middleware/auth';
import {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from './category.controller';

const router = express.Router();

// Get All Categories (Public)
router.get('/', getAllCategories);

//  Get Single Category by ID (Public)
router.get('/:id', getSingleCategory);

// Create Category (Protected, max 3 images)
router.post(
  '/createCategory',
  auth('user', 'admin'),
  upload.array('images', 3),
  createCategory
);

// Update Category (Protected, max 3 images)
router.patch(
  '/:id',
  auth('user', 'admin'),
  upload.array('images', 3),
  updateCategory
);

// Delete Category by ID (Protected)
router.delete(
  '/:id',
  auth('user', 'admin'), 
  deleteCategory
);

export const CategoryRoutes = router;
