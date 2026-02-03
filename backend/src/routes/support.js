import express from 'express';
import { contactSupport } from '../controllers/support.js';

const router = express.Router();

router
  .route('/')
  .post(contactSupport);

export default router;
