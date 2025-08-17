import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { authControllers } from './auth.controller';
import { authValidation } from './auth.validation';

const router = Router();

router.post(
  '/login',
  validateRequest(authValidation.loginZodSchema),
  authControllers.login,
);
router.post(
  '/refresh-token',
  validateRequest(authValidation.refreshTokenValidationSchema),
  authControllers.refreshToken,
);
router.post('/google', authControllers.googleLogin);
router.post('/facebook', authControllers.facebookLogin);
router.patch(
  '/change-password',
  auth(USER_ROLE.sup_admin, USER_ROLE.user),
  authControllers.changePassword,
);
router.patch('/reset-password', authControllers.resetPassword);
export const authRoutes = router;
