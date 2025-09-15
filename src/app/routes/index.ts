import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { adminRoutes } from '../modules/Dashboard/admin/admin.route';
import { ruleRoutes } from '../modules/Dashboard/Rules/rule.route';
import { CategoryRoutes } from '../modules/categoryList/category.route';
import ContactsRoutes from '../modules/contacts/contact.route';

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
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/contacts',
    route: ContactsRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
