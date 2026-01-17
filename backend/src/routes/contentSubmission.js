import express from 'express';
import { getSubmissions, getSubmission } from '../controllers/contentSubmission.js';
import { getSubmissionVersions } from '../controllers/contentSubmissionVersion.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { getSubmissionMessages } from '../controllers/contentSubmissionMessage.js';
import { getSubmissionReviewers, getSubmissionReviews } from '../controllers/contentSubmissionReview.js';
import { USER_ROLE } from '../utils/constants.js';
import { updateReviewAssignmentStatus } from '../controllers/contentReviewAssignment.js';
const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(getSubmissions);

router
  .route('/:id')
  .get(getSubmission);

router
  .route('/:id/status')
  .put(updateReviewAssignmentStatus);

router
  .route('/:id/versions')
  .get(getSubmissionVersions);

router
  .route('/:id/messages')
  .get(getSubmissionMessages);

router
  .route('/:id/reviews')
  .get(authorize(USER_ROLE.ADMIN, USER_ROLE.REVIEWER), getSubmissionReviews);

router
  .route('/:id/reviewers')
  .get(authorize(USER_ROLE.ADMIN), getSubmissionReviewers);

export default router;
