import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryService } from './category.service';
import { StatusCodes } from 'http-status-codes';
import { uploadFileToS3 } from '../../utils/uploadFileToS3';

// ✅ Create/Save Category
export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { categoryName } = req.body;

    let uploadedObjects: { id: string; url: string }[] = [];
    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = req.files.map((file: Express.Multer.File) =>
        uploadFileToS3(file, 'category/'),
      );
      uploadedObjects = await Promise.all(uploadPromises);
    }

    const result = await CategoryService.createCategory({
      categoryName,
      categoryImages: uploadedObjects,
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Category saved successfully',
      data: result,
    });
  },
);

// ✅ Get All Categories
export const getAllCategories = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Categories fetched successfully',
      data: result,
    });
  },
);

// ✅ Get Single Category
export const getSingleCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.getSingleCategory(id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Category fetched successfully',
      data: result,
    });
  },
);

// ✅ Update Category
export const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { categoryName } = req.body;

    let uploadedObjects: { id: string; url: string }[] = [];
    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = req.files.map((file: Express.Multer.File) =>
        uploadFileToS3(file, 'category/'),
      );
      uploadedObjects = await Promise.all(uploadPromises);
    }

    const result = await CategoryService.updateCategory(id, {
      ...(categoryName && { categoryName }),
      ...(uploadedObjects.length > 0 && { categoryImages: uploadedObjects }),
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Category updated successfully',
      data: result,
    });
  },
);

// ✅ Delete Category
export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Category deleted successfully',
      data: null,
    });
  },
);
