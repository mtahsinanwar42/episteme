import asyncHandler from "express-async-handler";
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO } from "../utils/constants.js";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createSubmissionService } from "../services/contentSubmission.js";
import { createConferenceService } from "../services/conference.js";

const { ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion, Conference, File } = initModels(sequelize);
const fileService = createFileService({ File });
const conferenceService = createConferenceService({ Conference, fileService });
const submissionService = createSubmissionService({ ContentSubmission, ContentSubmissionPayment, ContentSubmissionVersion, conferenceService, fileService });

// @desc    Get submissions
// @route   GET /api/v1/submissions
// @access  Private
export const getSubmissions = asyncHandler(async (req, res, next) => {
  const { page = DEFAULT_PAGE_NO, limit = DEFAULT_PAGE_LIMIT } = req.query;

  const submissions = await submissionService.getSubmissionsByUserIdAndRoles(req.user, { page, limit, });

  res.status(200).json({
    success: true,
    page: submissions.page,
    limit: submissions.limit,
    total: submissions.total,
    data: submissions.data,
  });
});

// @desc    Get submission by id
// @route   GET /api/v1/submissions/:id
// @access  Private
export const getSubmission = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const submission = await submissionService.getSubmissionById(req.user, { submissionId: id });

  res.status(200).json({
    success: true,
    data: submission,
  });
});

// @desc    Save submission
// @route   PUT /api/v1/submissions
// @access  Private
export const saveSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.saveSubmission(req.user, req.body);

  return res.status(200).json({
    success: true,
    data: submission,
  });
});

// @desc    Update submission DOI by id
// @route   PUT /api/v1/submissions/:id/doi
// @access  Private
export const updateSubmissionDoi = asyncHandler(async (req, res) => {
  const submission = await submissionService.updateSubmissionDoiById(req.params.id, req.body.doi);

  return res.status(200).json({
    success: true,
    data: submission,
  });
});

// @desc    Update submission status by id
// @route   PUT /api/v1/submissions/:id/status
// @access  Private
export const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const submission = await submissionService.updateSubmissionStatusById(req.user, req.params.id, req.body.status);

  return res.status(200).json({
    success: true,
    data: submission,
  });
});
