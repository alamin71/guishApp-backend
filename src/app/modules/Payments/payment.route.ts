import { Router } from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();
router.post(
  '/webhook',
  // express raw middleware to keep raw body for stripe webhook verification
  (req, res, next) => {
    require('express').raw({ type: 'application/json' })(req, res, next);
  },
  PaymentController.stripeWebhook,
);

router.post(
  '/create-payment-intent',
  auth(USER_ROLE.user), // Only logged in users
  PaymentController.createPaymentIntent,
);

router.post(
  '/save-payment',
  auth(USER_ROLE.user),
  PaymentController.savePayment,
);
router.get(
  '/all',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getAllPayments,
);

router.get(
  '/total-earnings',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getTotalEarnings,
);
router.get(
  '/monthly-earnings-stats',
  auth(USER_ROLE.admin),
  PaymentController.getMonthlyEarningsStats,
);
router.get(
  '/earnings-overview',
  auth(USER_ROLE.admin),
  PaymentController.getEarningsOverview,
);

router.get(
  '/todays-earnings',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getTodaysEarnings,
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getSinglePayment,
);

export const PaymentRoutes = router;
