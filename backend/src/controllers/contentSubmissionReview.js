import asyncHandler from "express-async-handler";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createSubmissionReviewService } from "../services/contentSubmissionReview.js";
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO } from "../utils/constants.js";
import { createEmailPublisher } from "../services/emailPublisher.js";

const { ContentReview, ContentReviewAssignment, ContentSubmission, User, ContentSubmissionVersion, File } = initModels(sequelize);
const fileService = createFileService({ File });
const emailPublisher = createEmailPublisher();
const submissionReviewService = createSubmissionReviewService({ ContentReview, ContentSubmission, ContentSubmissionVersion, ContentReviewAssignment, User, fileService, emailPublisher });

// @desc    Get submission reviews by id
// @route   GET /api/v1/submissions/:id/reviews
// @access  Private
export const getSubmissionReviews = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const reviews = await submissionReviewService.getSubmissionReviewsById(req.user, { submissionId: id });

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// @desc    Get submission reviewers by id
// @route   GET /api/v1/submissions/:id/reviewers
// @access  Private
export const getSubmissionReviewers = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { page = DEFAULT_PAGE_NO, limit = DEFAULT_PAGE_LIMIT } = req.query;
  const reviewers = await submissionReviewService.getSubmissionReviewersById(id, page, limit);

  res.status(200).json({
    success: true,
    page: reviewers.page,
    limit: reviewers.limit,
    total: reviewers.total,
    data: reviewers.data,
  });
});

// @desc    Save submission review
// @route   POST /api/v1/submissions/:id/reviews
// @access  Private
export const saveSubmissionReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await submissionReviewService.saveSubmissionReview(req.user, id, req.body);

  res.status(200).json({
    success: true,
    data: review,
  });
});
