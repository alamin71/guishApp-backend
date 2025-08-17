import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubscriptionService } from './subscription.service';
import { io } from '../../../../server';
import { sendAdminNotification } from '../../../../socketIo';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.create(req.body);

  // Notify all admins
  sendAdminNotification(io, {
    title: 'New Subscription Plan Created',
    message: `A new subscription plan "${(result as any).name}" has been created.`,
    type: 'subscription',
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Subscription created successfully',
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (_req: Request, res: Response) => {
  const result = await SubscriptionService.getAll();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscriptions retrieved successfully',
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.update(req.params.id, req.body);

  if (!result) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Subscription not found',
      data: null,
    });
  }

  // Notify all admins
  sendAdminNotification(io, {
    title: 'New Subscription Plan Created',
    message: `A new subscription plan "${(result as any).name}" has been created.`,
    type: 'subscription',
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription updated successfully',
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.delete(req.params.id);

  if (!result) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Subscription not found or already deleted',
      data: null,
    });
  }

  // Notify all admins
  sendAdminNotification(io, {
    title: 'Subscription Plan Deleted',
    message: `Subscription plan "${(result as any).name}" has been deleted.`,
    type: 'subscription',
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription deleted successfully',
    data: result,
  });
});

export const SubscriptionController = {
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
};
