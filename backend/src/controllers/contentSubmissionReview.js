import asyncHandler from "express-async-handler";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createSubmissionReviewService } from "../services/contentSubmissionReview.js";

const { ContentReview, File } = initModels(sequelize);
const fileService = createFileService({ File });
const submissionReviewService = createSubmissionReviewService({ ContentReview, fileService });

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
