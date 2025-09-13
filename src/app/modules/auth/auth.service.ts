/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import moment from 'moment';
import config from '../../config';
import AppError from '../../error/AppError';
import { sendEmail } from '../../utils/mailSender';
import { generateOtp } from '../../utils/otpGenerator';
import User from '../user/user.model';
import { TchangePassword, Tlogin, TresetPassword } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';
import { string } from 'zod';

const login = async (payload: Tlogin) => {
  // 1. Check if user exists & get hashed password
  const user = await User.isUserExist(payload.email as string);
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // 2. Check if user is active, verified, not deleted
  if (!user.isActive)
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  if (user.isDeleted)
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
  if (!user.isVerified)
    throw new AppError(httpStatus.BAD_REQUEST, 'User is not verified');

  // 3. Compare password
  const isMatch = await bcrypt.compare(payload.password, user.password!);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // 4. Create tokens
  const accessToken = createToken(
    { id: user._id.toString(), userId: user._id.toString(), role: user.role },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    { id: user._id.toString(), userId: user._id.toString(), role: user.role },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  // 5. Hide password before returning
  user.password = '';

  return { user, accessToken, refreshToken };
};
const changePassword = async (id: string, payload: TchangePassword) => {
  const user = await User.IsUserExistbyId(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isOldPasswordValid = await User.isPasswordMatched(
    payload.oldPassword,
    user.password,
  );

  if (!isOldPasswordValid) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match!');
  }

  if (payload.newPassword !== payload.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password and confirm password do not match!',
    );
  }

  const isSameAsOld = await User.isPasswordMatched(
    payload.newPassword,
    user.password,
  );

  if (isSameAsOld) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password cannot be same as old password!',
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    },
    { new: true },
  );

  return result;
};

// forgot password

const forgotPassword = async (email: string) => {
  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found ');
  }
  if (user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found');
  }
  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'your account is inactive');
  }
  const jwtPayload = {
    email: email,
    id: user?._id.toString(),
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '5m',
  });
  const currentTime = new Date();
  const otp = generateOtp();
  const expiresAt = moment(currentTime).add(5, 'minute');
  await User.findByIdAndUpdate(user?._id, {
    verification: {
      otp,
      expiresAt,
    },
  });
  await sendEmail(
    email,
    'your reset password otp is:',
    `<div><h5>your otp is: ${otp}</h5>
    <p>valid for:${expiresAt.toLocaleString()}</p>
    </div>`,
  );
  // send the mail here
  return { email, token };
};

const resetPassword = async (token: string, payload: TresetPassword) => {
  let decode;
  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Session has exipired. please try again',
    );
  }
  const user = await User.findById(decode?.id).select('isDeleted verification');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found');
  }
  if (new Date() > user?.verification?.expiresAt) {
    throw new AppError(httpStatus.FORBIDDEN, 'sessions expired');
  }
  if (!user?.verification?.status) {
    throw new AppError(httpStatus.FORBIDDEN, 'Otp is not verified yet!');
  }
  if (payload?.newPassword !== payload?.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password and Confirm password do not match!',
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );
  const result = await User.findByIdAndUpdate(decode?.id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
    verification: {
      otp: 0,
      status: false,
    },
  });
  return result;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  console.log('hitted');
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { userId } = decoded;
  console.log(decoded);
  const user = await User.IsUserExistbyId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }
  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const jwtPayload = {
    id: user.id!,
    userId: user.id!,
    role: user.role!,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};
export const authServices = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
