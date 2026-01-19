import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../error/AppError';
import User from '../user/user.model';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const googleClient = new OAuth2Client(config.google_client_id); // put in .env

// -------------------- Login --------------------
const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // Compare password
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // Generate JWT tokens (id + userId)
  const accessToken = jwt.sign(
    { id: user._id, userId: user._id, role: user.role },
    config.jwt_access_secret as Secret,
    { expiresIn: config.jwt_access_expires_in },
  );

  const refreshToken = jwt.sign(
    { id: user._id, userId: user._id, role: user.role },
    config.jwt_refresh_secret as Secret,
    { expiresIn: config.jwt_refresh_expires_in },
  );

  // Hide password before sending response
  user.password = '';

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

// -------------------- Reset Password --------------------
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { newPassword } = req.body;

  if (!token) throw new AppError(httpStatus.UNAUTHORIZED, 'Token missing');

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as Secret,
    ) as JwtPayload;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (!decoded?.id || !decoded?.allowReset) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP not verified or reset not allowed',
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  user.password = newPassword; // pre-save hook auto hash করবে
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: { user },
  });
});

// -------------------- Change Password --------------------
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch)
    throw new AppError(httpStatus.BAD_REQUEST, 'Old password is incorrect');

  user.password = newPassword; // pre-save hook auto hash করবে
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: { user },
  });
});

// -------------------- Refresh Token --------------------
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      config.jwt_refresh_secret as Secret,
    ) as JwtPayload;

    const token = jwt.sign(
      { id: decoded.id, userId: decoded.userId, role: decoded.role },
      config.jwt_access_secret as Secret,
      { expiresIn: config.jwt_access_expires_in },
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Access token refreshed',
      data: { token },
    });
  } catch {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Invalid or expired refresh token',
    );
  }
});

// -------------------- Google Login --------------------
// -------------------- Google Login --------------------
const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Google idToken is required');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google_client_id,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Google token');
  }

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      email: payload.email,
      fullName: payload.name,
      password: 'google-oauth-' + Math.random().toString(36).slice(2), // Random password
      isVerified: true,
    });
  }

  const accessToken = jwt.sign(
    { id: user._id, userId: user._id, role: user.role },
    config.jwt_access_secret as Secret,
    { expiresIn: config.jwt_access_expires_in },
  );
  const refreshToken = jwt.sign(
    { id: user._id, userId: user._id, role: user.role },
    config.jwt_refresh_secret as Secret,
    { expiresIn: config.jwt_refresh_expires_in },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Google login successful',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

// -------------------- Facebook Login --------------------
const facebookLogin = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Facebook accessToken is required',
    );
  }

  // Verify token and get user info from Facebook
  const fbRes = await axios.get(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
  );
  const { email, name } = fbRes.data;
  if (!email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Unable to get email from Facebook',
    );
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      fullName: name,
      isVerified: true,
    });
  }

  const accessTokenJwt = jwt.sign(
    { id: user._id, userId: user._id, role: user.role },
    config.jwt_access_secret as Secret,
    { expiresIn: config.jwt_access_expires_in },
  );
  const refreshToken = jwt.sign(
    { id: user._id, userId: user._id, role: user.role },
    config.jwt_refresh_secret as Secret,
    { expiresIn: config.jwt_refresh_expires_in },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Facebook login successful',
    data: {
      user,
      accessToken: accessTokenJwt,
      refreshToken,
    },
  });
});

export const authControllers = {
  login,
  resetPassword,
  changePassword,
  refreshToken,
  googleLogin,
  facebookLogin,
};
