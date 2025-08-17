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

// ---------------
// 1. Signup: send OTP and return temp token
const initiateSignup = async (payload: {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
  countryCode?: string;
  gender: 'Male' | 'Female';
}) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minute').toDate();

  // create token payload with user data + OTP info + mode signup
  const tokenPayload = {
    ...payload,
    otp,
    expiresAt,
    mode: 'signup',
  };

  const token = jwt.sign(tokenPayload, config.jwt_access_secret as Secret, {
    expiresIn: '5m',
  });

  // send email
  await sendOtpEmail(payload.email, otp, expiresAt);

  // return { token };
  return {
    token,
    ...(process.env.NODE_ENV !== 'production' && { otp }), // only show OTP in dev
  };
};

// 2. Signup: verify OTP & create user
const verifySignupOtp = async (token: string, otp: string | number) => {
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

  if (decoded.mode !== 'signup') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid token for signup verification',
    );
  }

  if (!decoded.otp || !decoded.expiresAt) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token data');
  }

  if (new Date() > new Date(decoded.expiresAt)) {
    throw new AppError(httpStatus.FORBIDDEN, 'OTP expired');
  }

  if (Number(otp) !== Number(decoded.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  // Create user now
  // const hashedPassword = await bcrypt.hash(decoded.password!, 12);
  const newUser = await User.create({
    email: decoded.email,
    fullName: decoded.fullName,
    password: decoded.password, // raw password, let pre-save hook hash it
    phoneNumber: decoded.phoneNumber,
    countryCode: decoded.countryCode,
    gender: decoded.gender,
    isVerified: true,
    role: 'user',
  });

  // Generate access token for login
  const accessToken = jwt.sign(
    { id: newUser._id, role: newUser.role },
    config.jwt_access_secret as Secret,
    { expiresIn: '30d' },
  );

  return { user: newUser, token: accessToken };
};

const resendSignupOtp = async (token: string) => {
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

  if (decoded.mode !== 'signup' || !decoded.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token for resend OTP');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minute').toDate();

  const { exp, iat, ...safeDecoded } = decoded;

  const newTokenPayload = {
    ...safeDecoded,
    otp,
    expiresAt,
  };

  const newToken = jwt.sign(
    newTokenPayload,
    config.jwt_access_secret as Secret,
    {
      expiresIn: '10m',
    },
  );

  await sendOtpEmail(decoded.email, otp, expiresAt);

  return {
    token: newToken,
    ...(process.env.NODE_ENV !== 'production' && { otp }),
  };
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
  initiateSignup,
  verifySignupOtp,
  resendSignupOtp,
  initiateForgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
};
