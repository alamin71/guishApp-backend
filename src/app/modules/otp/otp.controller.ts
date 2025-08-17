import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { otpServices } from './otp.service';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { io } from '../../../server';
import { saveNotification } from '../../utils/saveNotification'; // Adjust path if needed

// import { sendUserNotification, sendAdminNotification } from '../../../socketIo';

// 1. Signup initiate: send OTP & token (token is returned for OTP verification)
const signupInitiate = catchAsync(async (req: Request, res: Response) => {
  const result = await otpServices.initiateSignup(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent successfully. Please verify OTP to complete signup.',
    data: result,
  });
});

// 2. Signup OTP verify & create user
// const signupVerifyOtp = catchAsync(async (req: Request, res: Response) => {
//   const token = req.headers.token as string;
//   if (!token) {
//     throw new Error('Token required in headers');
//   }
//   const { otp } = req.body;
//   const result = await otpServices.verifySignupOtp(token, otp);
//   // Send welcome notification to user
//   sendUserNotification(io, result.user._id.toString(), {
//     title: 'Welcome to Glimmcatcher',
//     message: 'Your account has been created!',
//     type: 'welcome',
//   });

//   // Notify admins
//   sendAdminNotification(io, {
//     title: 'New User Registered',
//     message: `User ${result.user.email} has registered.`,
//     type: 'user',
//   });
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'OTP verified successfully. User created.',
//     data: result,
//   });
// });

// const signupVerifyOtp = catchAsync(async (req: Request, res: Response) => {
//   const token = req.headers.token as string;
//   if (!token) {
//     throw new Error('Token required in headers');
//   }

//   const { otp } = req.body;
//   const result = await otpServices.verifySignupOtp(token, otp);
//   const targetUserId = result.user._id.toString();

//   // 🔍 DEBUG: Check socket rooms before sending notification
//   console.log('🔍 DEBUG - Socket Rooms:');
//   console.log('  - All rooms:', Array.from(io.sockets.adapter.rooms.keys()));
//   console.log(
//     '  - Room for targetUserId exists:',
//     io.sockets.adapter.rooms.has(targetUserId),
//   );
//   console.log(
//     '  - Room for targetUserId (data):',
//     io.sockets.adapter.rooms.get(targetUserId),
//   );

//   try {
//     const notificationData = {
//       title: 'Welcome to Glimmcatcher',
//       message: 'Your account has been created!',
//       type: 'welcome',
//       userId: targetUserId,
//       timestamp: new Date().toISOString(),
//     };

//     console.log('📤 Sending notification:', notificationData);
//     console.log('📤 To room:', targetUserId);

//     const room = io.sockets.adapter.rooms.get(targetUserId);
//     if (!room || room.size === 0) {
//       console.log('❌ Room not found or empty for userId:', targetUserId);
//     } else {
//       console.log(
//         '✅ Room found with',
//         room.size,
//         'socket(s):',
//         Array.from(room),
//       );
//     }

//     // Emit to the user
//     sendUserNotification(io, targetUserId, notificationData);
//   } catch (err) {
//     console.error('❌ Error sending user notification:', err);
//   }

//   // Notify admins
//   try {
//     const adminNotification = {
//       title: 'New User Registered',
//       message: `User ${result.user.email} has registered.`,
//       type: 'user',
//       userId: targetUserId,
//       timestamp: new Date().toISOString(),
//     };

//     console.log('📤 Sending admin notification:', adminNotification);
//     sendAdminNotification(io, adminNotification);
//   } catch (err) {
//     console.error('❌ Error sending admin notification:', err);
//   }

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'OTP verified successfully. User created.',
//     data: result,
//   });
// });
const signupVerifyOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.token as string;
  if (!token) {
    throw new Error('Token required in headers');
  }

  const { otp } = req.body;
  const result = await otpServices.verifySignupOtp(token, otp);
  const targetUserId = result.user._id.toString();

  // 🔍 DEBUG: Check socket rooms before sending notification
  console.log('🔍 DEBUG - Socket Rooms:');
  console.log('  - All rooms:', Array.from(io.sockets.adapter.rooms.keys()));
  console.log(
    '  - Room for targetUserId exists:',
    io.sockets.adapter.rooms.has(targetUserId),
  );
  console.log(
    '  - Room for targetUserId (data):',
    io.sockets.adapter.rooms.get(targetUserId),
  );

  // ✅ Send notification to user (DB save + real-time)
  try {
    const title = 'Welcome to Glimmcatcher';
    const message = 'Your account has been created!';
    const type: 'welcome' = 'welcome';

    await saveNotification({
      userId: targetUserId,
      userType: 'User',
      title,
      message,
      type,
    });

    console.log('📤 Sending real-time notification to user:', {
      userId: targetUserId,
      title,
      message,
      type,
    });
  } catch (err) {
    console.error('❌ Error sending user notification:', err);
  }

  // ✅ Notify admin about new user signup
  try {
    const adminTitle = 'New User Registered';
    const adminMessage = `User ${result.user.email} has registered.`;
    const adminType: 'admin' = 'admin';

    const adminUserId = process.env.SUPER_ADMIN_ID || '64xxxxxx'; // Replace with real ID

    await saveNotification({
      userId: adminUserId,
      userType: 'Admin',
      title: adminTitle,
      message: adminMessage,
      type: adminType,
    });

    console.log('📤 Sending real-time notification to admin:', {
      userId: adminUserId,
      title: adminTitle,
      message: adminMessage,
      type: adminType,
    });
  } catch (err) {
    console.error('❌ Error sending admin notification:', err);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully. User created.',
    data: result,
  });
});

// 3. Resend signup OTP
const resendSignupOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.token as string;
  if (!token) {
    throw new Error('Token required in headers');
  }
  const result = await otpServices.resendSignupOtp(token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP resent successfully. Please verify OTP.',
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
  signupInitiate,
  signupVerifyOtp,
  resendSignupOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
};
