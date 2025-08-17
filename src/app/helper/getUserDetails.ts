import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import config from '../config';
import AppError from '../error/AppError';

const getUserDetailsFromToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  try {
    // Verify the token and decode its payload
    const decode: any = jwt.verify(token, config.jwt_access_secret as string);
    console.log(decode);
    // let user;
    // if (decode?.role === UserRole.provider) {
    //   user = await Provider.findById(decode?.profileId);
    // } else if (decode?.role === UserRole.customer) {
    //   user = await Customer.findById(decode?.profileId);
    // }

    // if (!user) {
    //   throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    // }

    return decode;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
    } else {
      throw error; // Re-throw any other unexpected errors
    }
  }
};

export default getUserDetailsFromToken;
