import { Admin } from './admin.model';
import AppError from '../../../error/AppError';
import httpStatus from 'http-status';

const updateAdminProfile = async (id: string, payload: Record<string, any>) => {
  const allowedFields = ['fullName', 'phoneNumber', 'image'];
  const updateData: Record<string, any> = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  });
  const admin = await Admin.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!admin) throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');

  return admin;
};

const changePassword = async (
  id: string,
  oldPassword: string,
  newPassword: string,
) => {
  const admin = await Admin.findById(id).select('+password');
  if (!admin) throw new AppError(404, 'Admin not found');

  const isMatch = await admin.isPasswordMatched(oldPassword);
  if (!isMatch) throw new AppError(401, 'Old password incorrect');

  admin.password = newPassword;
  await admin.save();
};

const setForgotOtp = async (email: string) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new AppError(404, 'Admin not found');

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  admin.verification = { otp, expiresAt, verified: false };
  await admin.save();

  return otp;
};

const verifyOtp = async (email: string, otp: number) => {
  const admin = await Admin.findOne({ email });
  if (!admin || !admin.verification)
    throw new AppError(404, 'OTP not generated');

  if (admin.verification.verified)
    throw new AppError(400, 'OTP already verified');

  if (Date.now() > new Date(admin.verification.expiresAt).getTime()) {
    throw new AppError(400, 'OTP expired');
  }

  if (admin.verification.otp !== otp) throw new AppError(400, 'Invalid OTP');

  admin.verification.verified = true;
  await admin.save();
};

const resetPassword = async (email: string, newPassword: string) => {
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !admin.verification?.verified) {
    throw new AppError(400, 'OTP not verified');
  }

  admin.password = newPassword;
  admin.verification = undefined;
  await admin.save();
};

export const adminService = {
  updateAdminProfile,
  changePassword,
  setForgotOtp,
  verifyOtp,
  resetPassword,
};
