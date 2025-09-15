// // src/modules/contact/contact.route.ts
// import express from 'express';
// import { contactController } from './contact.controller';
// import auth from '../../middleware/auth';

// const router = express.Router();

// router.post('/import', auth(), contactController.importContacts);

// export default router;


import express from 'express';
import { contactController } from './contact.controller';
import auth from '../../middleware/auth';

const router = express.Router();

// Import contacts
router.post('/import', auth(), contactController.importContacts);

// Get all contacts for logged-in user
router.get('/', auth(), contactController.getAllContacts);

export default router;
