
import express from 'express';
import { contactController } from './contact.controller';
import auth from '../../middleware/auth';

const router = express.Router();

// Import contacts
router.post('/import', auth(), contactController.importContacts);

export default router;
