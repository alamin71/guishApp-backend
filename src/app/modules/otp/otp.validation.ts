import { z } from 'zod';

const signupInitiateSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    otp: z.string().min(4).max(6),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const otpValidation = {
  signupInitiateSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
};
