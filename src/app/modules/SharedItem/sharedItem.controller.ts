import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import SharedItem from './sharedItem.model';
import Category from '../categoryList/category.model';
import { StatusCodes } from 'http-status-codes';
import { ICategory } from '../categoryList/category.interface';
import { ISharedItem } from './sharedItem.interface';
import { HydratedDocument } from 'mongoose';

interface MongoError extends Error {
  code?: number;
}

interface PopulatedSharedItem extends Omit<ISharedItem, 'category'> {
  category: ICategory;
}

// Helper: Get or create AllShare category (FIXED - Race condition safe)
const getAllShareCategory = async (
  userId: string,
): Promise<HydratedDocument<ICategory>> => {
  try {
    const allShare = await Category.findOneAndUpdate(
      {
        createdBy: userId,
        categoryName: 'AllShare',
      },
      {
        categoryName: 'AllShare',
        createdBy: userId,
        categoryImages: [],
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    if (!allShare) {
      throw new Error('Failed to create or fetch AllShare category');
    }

    return allShare;
  } catch (err) {
    const error = err as MongoError;
    if (error.code === 11000) {
      const existingCategory = await Category.findOne({
        createdBy: userId,
        categoryName: 'AllShare',
      });
      if (existingCategory) {
        return existingCategory;
      }
    }
    throw error;
  }
};

// Share item (automatic AllShare assignment)
const shareItemHandler = async (req: Request, res: Response): Promise<void> => {
  const { title, url, type } = req.body as {
    title: string;
    url: string;
    type: 'video' | 'link' | 'file';
  };
  const sharedBy = req.user?.id as string | undefined;

  if (!sharedBy) {
    sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
    return;
  }

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
};

export const shareItem = catchAsync(shareItemHandler);

// Move item to another category
const moveItemToCategoryHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { itemId, categoryId } = req.body as {
    itemId: string;
    categoryId: string;
  };
  const sharedBy = req.user?.id as string | undefined;

  const item = await SharedItem.findOne({ _id: itemId, sharedBy });
  if (!item) {
    sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Shared item not found',
      data: null,
    });
    return;
  }

  item.category = categoryId as unknown as typeof item.category;
  await item.save();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Item moved to category successfully',
    data: item,
  });
};

export const moveItemToCategory = catchAsync(moveItemToCategoryHandler);

// Get AllShare items
const getAllSharedItemsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const sharedBy = req.user?.id as string;
  const allShareCategory = await getAllShareCategory(sharedBy);

  const items = await SharedItem.find({
    sharedBy,
    category: allShareCategory._id,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'AllShare items fetched',
    data: items,
  });
};

export const getAllSharedItems = catchAsync(getAllSharedItemsHandler);

// Get items by category
const getItemsByCategoryHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { categoryId } = req.params;
  const sharedBy = req.user?.id as string;

  const items = await SharedItem.find({
    sharedBy,
    category: categoryId,
  }).populate<{ category: ICategory }>({
    path: 'category',
    select: 'categoryName',
  });

  const formattedItems = items.map((item) => {
    const populatedItem = item as unknown as PopulatedSharedItem;
    return {
      ...item.toObject(),
      category: {
        id: populatedItem.category?._id,
        categoryName: populatedItem.category?.categoryName,
      },
    };
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category items fetched',
    data: formattedItems,
  });
};

export const getItemsByCategory = catchAsync(getItemsByCategoryHandler);
