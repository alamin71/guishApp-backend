import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import AppError from '../error/AppError';
import User from '../modules/user/user.model';

export const checkSubscriptionValidity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const now = new Date();

  if (
    !user.subscription ||
    user.subscription.status !== 'active' ||
    new Date(user.subscription.expiresAt) < now
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your subscription has expired or is inactive. Please renew to access this feature.',
    );
  }

  next();
};
