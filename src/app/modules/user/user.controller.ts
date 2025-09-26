import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { userServices } from './user.service';
import { io } from '../../../server';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import User from './user.model'; // <-- Add this import for the User model
import Category from '../categoryList/category.model'; // import Category model
import SharedItem from '../SharedItem/sharedItem.model'; // import SharedItem model
// Get current user's profile
const getme = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getme(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

// Update user phone number (only phoneNumber & countryCode allowed)
const updatePhoneNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.updatePhoneNumber(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Phone number updated successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  let image;

  // Upload image if provided
  if (req.file) {
    image = await uploadToS3(req.file, 'profile/');
  }

  // Determine which user's profile is being updated
  const isAdmin = req.user.role === 'admin' || req.user.role === 'sup_admin';
  const userIdToUpdate = isAdmin && req.params.id ? req.params.id : req.user.id;

  // 🔍 DEBUG: Log all relevant IDs
  console.log('🔍 DEBUG - Profile Update:');
  console.log('  - req.user.id:', req.user.id, typeof req.user.id);
  console.log('  - req.params.id:', req.params.id, typeof req.params.id);
  console.log('  - userIdToUpdate:', userIdToUpdate, typeof userIdToUpdate);
  console.log('  - isAdmin:', isAdmin);

  // If admin is updating their own profile, make gender optional
  const isAdminUpdatingSelf = isAdmin && userIdToUpdate === req.user.id;

  // Build update data
  const updateData: Record<string, any> = {
    ...req.body,
    ...(image && { image }),
  };

  // Remove gender if admin is updating their own profile and gender is missing
  if (isAdminUpdatingSelf && !req.body.gender) {
    delete updateData.gender;
  }

  // Call the service to update
  const result = await userServices.updateProfile(userIdToUpdate, updateData);

  // ===== SOCKET.IO ROOM & SOCKET DEBUG LOGS =====
  console.log('🔍 DEBUG - Socket Rooms:');
  console.log('  - All rooms:', Array.from(io.sockets.adapter.rooms.keys()));

  const roomExists = io.sockets.adapter.rooms.has(userIdToUpdate.toString());
  console.log(
    `  - Room for userIdToUpdate (${userIdToUpdate}) exists:`,
    roomExists,
  );

  if (roomExists) {
    const roomSockets = io.sockets.adapter.rooms.get(userIdToUpdate.toString());
    console.log(
      `  - Room ${userIdToUpdate} sockets count:`,
      roomSockets?.size,
      'Socket IDs:',
      roomSockets ? Array.from(roomSockets) : [],
    );
  } else {
    console.log(`❌ Room not found for userId: ${userIdToUpdate}`);
  }

  // Respond with updated user info and context
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: {
      updatedUser: result,
      updatedBy: {
        id: req.user.id,
        role: req.user.role,
        actingOn: userIdToUpdate,
      },
    },
  });
});
// Update personal information
const updatePersonalInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.updatePersonalInfo(req.user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Personal information updated successfully',
    data: result,
  });
});

// Get personal info for current user
const getPersonalInfo = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id)
    .select('-password -__v -isDeleted -needsPasswordChange') // exclude sensitive/internal fields
    .lean();

  if (!user) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'User not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Personal information fetched successfully',
    data: user,
  });
});


// Get single user (used by admin)
const getsingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});


//get profile information and categories names by id
// const getProfile = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.params.id; // from URL get user ID 

//   // find user
//   const user = await User.findById(userId)
//     .select('-password -__v -isDeleted -needsPasswordChange') 
//     .lean();

//   if (!user) {
//     return sendResponse(res, {
//       statusCode: 404,
//       success: false,
//       message: 'User not found',
//       data: null,
//     });
//   }

//   // user jodi kono category create kore thake tader nam ebong chobi niye asa
//   const categories = await Category.find({ createdBy: user._id })
//     .select('categoryName categoryImages -_id') 
//     .lean();


//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User profile fetched successfully',
//     data: {
//       ...user,
//       categories: categories, 
//     },
//   });
// });
// get profile information and categories names by id
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  // find user
  const user = await User.findById(userId)
    .select('-password -__v -isDeleted -needsPasswordChange')
    .lean();

  if (!user) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'User not found',
      data: null,
    });
  }

  // user jodi kono category create kore thake tader nam, chobi, ebong id niye asa
  const categories = await Category.find({ createdBy: user._id })
    .select('_id categoryName categoryImages') // এখানে `_id` রাখলাম
    .lean();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile fetched successfully',
    data: {
      ...user,
      categories,
    },
  });
});

// Get items of a user's category (for profile view)
const getUserCategoryItems = catchAsync(async (req: Request, res: Response) => {
  const { userId, categoryId } = req.params;

  // check user exists
  const user = await User.findById(userId);
  if (!user) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'User not found',
      data: null,
    });
  }

  // check category exists under that user
  const category = await Category.findOne({
    _id: categoryId,
    createdBy: userId,
  });
  if (!category) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Category not found for this user',
      data: null,
    });
  }

  // get shared items of that category
  const items = await SharedItem.find({
    sharedBy: userId,
    category: categoryId,
  }).select('title url type createdAt');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category items fetched successfully',
    data: {
      category: {
        id: category._id,
        name: category.categoryName,
        images: category.categoryImages,
      },
      items,
    },
  });
});

// Get all users (used by admin)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Delete own account (soft delete)
const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.deleteAccount(
    req.user.id,
    req.body.password,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User account deleted successfully',
    data: result,
  });
});
//total users count by admin
const getTotalUsersCount = catchAsync(async (_req: Request, res: Response) => {
  const count = await userServices.getTotalUsersCount();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Total users count fetched successfully',
    data: count,
  });
});
//monthly user starts by admin
const getMonthlyUserStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await userServices.getMonthlyUserStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Monthly user stats fetched successfully',
    data: result,
  });
});
//Get 12-month user growth overview by admin
const getUserGrowthOverview = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;
    const result = await userServices.getUserGrowthPercentage(year);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: '12-month user growth fetched successfully',
      data: result,
    });
  },
);
const blockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.blockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User blocked successfully',
    data: result,
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.unblockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User unblocked successfully',
    data: result,
  });
});

export const userControllers = {
  getme,
  updateProfile,
  getProfile,
  getUserCategoryItems,
  updatePersonalInfo,
  getPersonalInfo,
  getsingleUser,
  getAllUsers,
  deleteAccount,
  updatePhoneNumber,
  getTotalUsersCount,
  getMonthlyUserStats,
  getUserGrowthOverview,
  blockUser,
  unblockUser,
};
