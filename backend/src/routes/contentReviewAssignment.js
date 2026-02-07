import express from 'express';
import { USER_ROLE } from '../utils/constants.js';
import { getMyReviewAssignments, getReviewAssignments, searchReviewAssignments, saveReviewAssignment, updateReviewAssignmentStatus } from '../controllers/contentReviewAssignment.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(USER_ROLE.ADMIN), getReviewAssignments)
  .post(authorize(USER_ROLE.ADMIN), saveReviewAssignment);

router
  .route('/me')
  .get(authorize(USER_ROLE.REVIEWER), getMyReviewAssignments);

router
  .route('/search')
  .get(authorize(USER_ROLE.REVIEWER, USER_ROLE.ADMIN), searchReviewAssignments);

router
  .route('/:id/status')
  .put(authorize(USER_ROLE.REVIEWER, USER_ROLE.ADMIN), updateReviewAssignmentStatus);

export default router;
