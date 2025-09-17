import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import SharedItem from './sharedItem.model';
import Category from '../categoryList/category.model';
import { StatusCodes } from 'http-status-codes';

// Helper: Get or create AllShare category
const getAllShareCategory = async (userId: string) => {
  let allShare = await Category.findOne({ createdBy: userId, categoryName: 'AllShare' });
  if (!allShare) {
    allShare = await Category.create({
      categoryName: 'AllShare',
      createdBy: userId,
      categoryImages: [],
    });
  }
  return allShare;
};

// Share item (automatic AllShare assignment)
export const shareItem = catchAsync(async (req: Request, res: Response) => {
  const { title, url, type } = req.body;
  const sharedBy = req.user?.id;

  if (!sharedBy) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
  }

  // Get default AllShare category
  const allShareCategory = await getAllShareCategory(sharedBy);

  const item = await SharedItem.create({
    title,
    url,
    type,
    sharedBy,
    category: allShareCategory._id,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Item shared successfully (AllShare)',
    data: item,
  });
});

// Move item to another category
export const moveItemToCategory = catchAsync(async (req: Request, res: Response) => {
  const { itemId, categoryId } = req.body;
  const sharedBy = req.user?.id;

  const item = await SharedItem.findOne({ _id: itemId, sharedBy });
  if (!item) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Shared item not found',
      data: null,
    });
  }

  item.category = categoryId;
  await item.save();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Item moved to category successfully',
    data: item,
  });
});

// Get AllShare items
export const getAllSharedItems = catchAsync(async (req: Request, res: Response) => {
  const sharedBy = req.user?.id;
  const allShareCategory = await getAllShareCategory(sharedBy!);

  const items = await SharedItem.find({ sharedBy, category: allShareCategory._id });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'AllShare items fetched',
    data: items,
  });
});

// Get items by category
export const getItemsByCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const sharedBy = req.user?.id;

  const items = await SharedItem.find({ sharedBy, category: categoryId });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category items fetched',
    data: items,
  });
});
