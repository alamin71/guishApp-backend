
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../error/AppError';
import catchAsync from '../utils/catchAsync';
import User from '../modules/user/user.model';
import { Admin } from '../modules/Dashboard/admin/admin.model';

const auth = (...userRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    const id = decoded.id || decoded.userId;
    const role = decoded.role;

    let isExist = null;
    if (role === 'admin' || role === 'super_admin') {
      isExist = await Admin.findById(id).select('+password');
    } else {
      isExist = await User.IsUserExistbyId(id);
    }

    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, `${role} not found`);
    }

    if (userRoles.length && !userRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    req.user = {
      id: isExist._id,
      userId: isExist._id,
      _id: isExist._id, 
      email: isExist.email,
      role: isExist.role,
    };
    next();
  });
};

export default auth;
