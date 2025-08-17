import express from 'express';
import { SubscriptionController } from './subscription.controller';
import auth from '../../../middleware/auth';
import { USER_ROLE } from '../../user/user.constant';

const router = express.Router();

router.post(
  '/create-subscription',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  SubscriptionController.createSubscription,
);
router.get('/', SubscriptionController.getAllSubscriptions);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  SubscriptionController.updateSubscription,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  SubscriptionController.deleteSubscription,
);

export const SubscriptionRoutes = router;
