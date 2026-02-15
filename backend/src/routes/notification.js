import express from 'express';
import { getNotifications, getStatus, markAsRead, saveNotification } from '../controllers/notification.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { USER_ROLE } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(USER_ROLE.USER, USER_ROLE.REVIEWER, USER_ROLE.ADMIN), getNotifications)
  .post(authorize(USER_ROLE.ADMIN), saveNotification);

router
  .route('/status')
  .get(authorize(USER_ROLE.USER, USER_ROLE.REVIEWER, USER_ROLE.ADMIN), getStatus);

router
  .route('/read')
  .post(authorize(USER_ROLE.USER, USER_ROLE.REVIEWER, USER_ROLE.ADMIN), markAsRead);

export default router;
