import { Router } from 'express';
import { otpControllers } from './otp.controller';
import validateRequest from '../../middleware/validateRequest';
import { otpValidation } from '../otp/otp.validation';

const router = Router();

// User Signup OTP
router.post(
  '/signup',
  validateRequest(otpValidation.signupInitiateSchema),
  otpControllers.signup,
);
router.post(
  '/login',
  validateRequest(otpValidation.signupInitiateSchema),
  otpControllers.login,
);

//  Forgot Password OTP
router.post(
  '/forgot-password',
  validateRequest(otpValidation.forgotPasswordSchema),
  otpControllers.forgotPassword,
);

router.post(
  '/forgot-password/verify',
  validateRequest(otpValidation.verifyOtpSchema),
  otpControllers.verifyForgotPasswordOtp,
);

router.post('/forgot/resend', otpControllers.resendForgotPasswordOtp);

export const otpRoutes = router;
