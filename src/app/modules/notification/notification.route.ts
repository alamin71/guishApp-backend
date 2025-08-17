import express from 'express';
import { getNotifications } from '../notification/notification.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.sup_admin),
  getNotifications,
);

export default router;
