import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { otpServices } from './otp.service';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { authService } from './otp.service';

// -------------------- Signup --------------------
const signup = catchAsync(async (req: Request, res: Response) => {
  const { email, password, confirmPassword } = req.body;

  const result = await authService.signup({
    email,
    password,
    confirmPassword,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Signup successfull',
    data: result,
  });
});

// 4. Forgot password: send OTP + reset token
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await otpServices.initiateForgotPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent for password reset. Please verify OTP.',
    data: result,
  });
});

// 5. Forgot password OTP verify & allow reset token
const verifyForgotPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.token as string;
    if (!token) {
      throw new Error('Token required in headers');
    }
    const { otp } = req.body;
    const result = await otpServices.verifyForgotPasswordOtp(token, otp);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OTP verified. You can now reset your password.',
      data: result,
    });
  },
);

// 6. Resend forgot password OTP
const resendForgotPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.token as string;
    if (!token) {
      throw new Error('Token required in headers');
    }
    const result = await otpServices.resendForgotPasswordOtp(token);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OTP resent successfully. Please verify OTP.',
      data: result,
    });
  },
);

export const otpControllers = {
  signup,
  forgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
};
