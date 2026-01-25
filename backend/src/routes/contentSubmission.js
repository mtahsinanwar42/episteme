import express from 'express';
import { getSubmissions, getSubmission, updateSubmissionStatus, saveSubmission } from '../controllers/contentSubmission.js';
import { getSubmissionVersions, saveSubmissionVersion } from '../controllers/contentSubmissionVersion.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { getSubmissionMessages, saveSubmissionMessage } from '../controllers/contentSubmissionMessage.js';
import { getSubmissionReviewers, getSubmissionReviews, saveSubmissionReview } from '../controllers/contentSubmissionReview.js';
import { USER_ROLE } from '../utils/constants.js';
const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(USER_ROLE.USER, USER_ROLE.ADMIN), getSubmissions)
  .post(authorize(USER_ROLE.USER), saveSubmission);

router
  .route('/:id')
  .get(getSubmission);

router
  .route('/:id/status')
  .put(authorize(USER_ROLE.ADMIN), updateSubmissionStatus);

router
  .route('/:id/versions')
  .get(getSubmissionVersions)
  .post(saveSubmissionVersion);

router
  .route('/:id/messages')
  .get(getSubmissionMessages)
  .post(saveSubmissionMessage);

router
  .route('/:id/reviews')
  .get(authorize(USER_ROLE.ADMIN, USER_ROLE.REVIEWER), getSubmissionReviews)
  .post(authorize(USER_ROLE.REVIEWER), saveSubmissionReview);

router
  .route('/:id/reviewers')
  .get(authorize(USER_ROLE.ADMIN), getSubmissionReviewers);

export default router;
