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
  const {
    page = DEFAULT_PAGE_NO,
    limit = DEFAULT_PAGE_LIMIT,
    paginate = "true",
  } = req.query;
  const shouldPaginate = !/^(false|0|no)$/i.test(String(paginate));
  const reviewers = await submissionReviewService.getSubmissionReviewersById(
    id,
    page,
    limit,
    shouldPaginate,
  );

  const response = {
    success: true,
    total: reviewers.total,
    data: reviewers.data,
  };

  if (shouldPaginate) {
    response.page = reviewers.page;
    response.limit = reviewers.limit;
  }

  res.status(200).json(response);
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
