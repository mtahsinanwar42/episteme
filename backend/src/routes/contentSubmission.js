import express from 'express';
import { getSubmissions, getSubmission, updateSubmissionStatus, saveSubmission } from '../controllers/contentSubmission.js';
import { getSubmissionVersions } from '../controllers/contentSubmissionVersion.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { getSubmissionMessages, saveSubmissionMessage } from '../controllers/contentSubmissionMessage.js';
import { getSubmissionReviewers, getSubmissionReviews } from '../controllers/contentSubmissionReview.js';
import { USER_ROLE } from '../utils/constants.js';
const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(getSubmissions)
  .post(authorize(USER_ROLE.USER), saveSubmission);

router
  .route('/:id')
  .get(getSubmission)
  .put(authorize(USER_ROLE.ADMIN, USER_ROLE.USER), updateSubmissionStatus);

router
  .route('/:id/status')
  .put(updateSubmissionStatus);

router
  .route('/:id/versions')
  .get(getSubmissionVersions);

router
  .route('/:id/messages')
  .get(getSubmissionMessages)
  .post(saveSubmissionMessage);

router
  .route('/:id/reviews')
  .get(authorize(USER_ROLE.ADMIN, USER_ROLE.REVIEWER), getSubmissionReviews);

router
  .route('/:id/reviewers')
  .get(authorize(USER_ROLE.ADMIN), getSubmissionReviewers);

export default router;
