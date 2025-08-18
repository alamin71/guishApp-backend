import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';
import User from '../user/user.model';
import { generateOtp } from '../../utils/otpGenerator';
import moment from 'moment';
import { sendEmail } from '../../utils/mailSender';
import bcrypt from 'bcrypt';

type JwtPayloadExtended = JwtPayload & {
  mode?: 'signup' | 'reset-password';
  email?: string;
  id?: string;
  otp?: number;
  expiresAt?: Date;
  allowReset?: boolean;
};

const sendOtpEmail = async (email: string, otp: number, expiresAt: Date) => {
  await sendEmail(
    email,
    'Your One Time OTP',
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP Is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiresAt.toLocaleString()}</p>
      </div>
    </div>`,
  );
};

export const authService = {
  // -------------------- Signup --------------------
  signup: async ({
    email,
    password,
    confirmPassword,
  }: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (password !== confirmPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Password and Confirm Password not match',
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'User already exists');
    }

    const user = await User.create({
      email,
      password,
      isVerified: true,
      role: 'user',
    });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwt_access_secret as string,
      { expiresIn: '30d' },
    );

    return { user, token: accessToken };
  },
};
// 4. Forgot password - send OTP and token
const initiateForgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minute').toDate();

  // Save OTP and expiry to user doc if you want (optional)
  user.verification = {
    otp,
    expiresAt,
    status: false,
  };
  await user.save();

  // Token payload for forgot-password mode
  const tokenPayload = {
    id: user._id,
    email: user.email,
    mode: 'reset-password',
  };

  const token = jwt.sign(tokenPayload, config.jwt_access_secret as Secret, {
    expiresIn: '10m',
  });

  await sendOtpEmail(email, otp, expiresAt);

  // return { token };
  return {
    token,
    ...(process.env.NODE_ENV !== 'production' && { otp }), // only show OTP in dev
  };
};

// 5. Verify forgot password OTP and allow reset
const verifyForgotPasswordOtp = async (token: string, otp: string | number) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
  }

  let decoded: JwtPayloadExtended;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayloadExtended;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (decoded.mode !== 'reset-password' || !decoded.id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid token for password reset',
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (
    !user.verification ||
    !user.verification.otp ||
    !user.verification.expiresAt
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP data missing');
  }

  if (new Date() > new Date(user.verification.expiresAt)) {
    throw new AppError(httpStatus.FORBIDDEN, 'OTP expired');
  }

  if (Number(otp) !== Number(user.verification.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  // OTP verified - set allowReset flag in token
  const resetToken = jwt.sign(
    {
      id: user._id,
      allowReset: true,
      mode: 'reset-password',
    },
    config.jwt_access_secret as Secret,
    { expiresIn: '10m' },
  );

  // Update user verification status
  user.verification.status = true;
  await user.save();

  return { user, token: resetToken };
};

// 6. Resend forgot password OTP
const resendForgotPasswordOtp = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
  }
  let decoded: JwtPayloadExtended;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayloadExtended;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (decoded.mode !== 'reset-password' || !decoded.id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token for resend OTP');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const otp = Number(generateOtp());
  const expiresAt = moment().add(5, 'minute').toDate();

  user.verification = {
    otp,
    expiresAt,
    status: false,
  };
  await user.save();

  const newToken = jwt.sign(
    {
      id: user._id,
      mode: 'reset-password',
    },
    config.jwt_access_secret as Secret,
    { expiresIn: '10m' },
  );

  await sendOtpEmail(user.email, otp, expiresAt);

  return { token: newToken };
};

export const otpServices = {
  initiateForgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
};
