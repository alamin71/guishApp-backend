import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import walletRoutes from '../modules/wallet/wallet.route';
import { adminRoutes } from '../modules/Dashboard/admin/admin.route';
import { ruleRoutes } from '../modules/Dashboard/Rules/rule.route';
import { SubscriptionRoutes } from '../modules/Dashboard/Subscription/subscription.routes';
import { PaymentRoutes } from '../modules/Payments/payment.route';
import NotificationRoutes from '../modules/notification/notification.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },

  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/rules',
    route: ruleRoutes,
  },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/payment',
    route: PaymentRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/wallet',
    route: walletRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
