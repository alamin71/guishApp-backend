import { Router } from 'express';
import { USER_ROLE } from '../../user/user.constant';
import { RuleController } from './rule.controller';
import auth from '../../../middleware/auth';
import { RuleValidation } from '../../Dashboard/Rules/rule.validation';

const router = Router();

//about us
router.post(
  '/create-about',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createAbout,
);

router.get('/about', RuleController.getAbout);

//privacy policy
router.post(
  '/create-privacy-policy',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createPrivacyPolicy,
);
//get privacy
router.get('/privacy-policy', RuleController.getPrivacyPolicy);

//terms and conditions
router.post(
  '/create-terms-and-conditions',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.createTermsAndCondition,
);
//get terms and conditions
router.get('/terms-and-condition', RuleController.getTermsAndCondition);

//rule update
router.patch(
  '/update',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  RuleController.updateRuleContent,
);

export const ruleRoutes = router;
