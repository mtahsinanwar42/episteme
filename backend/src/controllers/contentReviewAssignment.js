import asyncHandler from "express-async-handler";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createReviewAssignmentService } from "../services/contentReviewAssignment.js";
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO } from "../utils/constants.js";
import { createEmailPublisher } from "../services/emailPublisher.js";
import { createNotificationPublisher } from "../services/notificationPublisher.js";
import { createNotificationService } from "../services/notification.js";

const { ContentReviewAssignment, ContentSubmission, User, File, Notification } = initModels(sequelize);
const fileService = createFileService({ File });
const emailPublisher = createEmailPublisher();
const notificationService = createNotificationService({ Notification });
const notificationPublisher = createNotificationPublisher({ notificationService });
const reviewAssignmentService = createReviewAssignmentService({ ContentReviewAssignment, ContentSubmission, User, fileService, emailPublisher, notificationPublisher });

// @desc    Get review assignments
// @route   GET /api/v1/review-assignments
// @access  Private
export const getReviewAssignments = asyncHandler(async (req, res, next) => {
  const { page = DEFAULT_PAGE_NO, limit = DEFAULT_PAGE_LIMIT } = req.query;
  const assignments = await reviewAssignmentService.getReviewAssignments(page, limit);

  res.status(200).json({
    success: true,
    page: assignments.page,
    limit: assignments.limit,
    total: assignments.total,
    data: assignments.data,
  });
});

// @desc    Get My review assignments
// @route   GET /api/v1/review-assignments/me
// @access  Private
export const getMyReviewAssignments = asyncHandler(async (req, res, next) => {
  const { page = DEFAULT_PAGE_NO, limit = DEFAULT_PAGE_LIMIT } = req.query;
  const assignments = await reviewAssignmentService.getMyReviewAssignments(req.user, page, limit);

  res.status(200).json({
    success: true,
    page: assignments.page,
    limit: assignments.limit,
    total: assignments.total,
    data: assignments.data,
  });
});

// @desc    Search review assignments
// @route   GET /api/v1/review-assignments/search
// @access  Private
export const searchReviewAssignments = asyncHandler(async (req, res) => {
  const {
    page = DEFAULT_PAGE_NO,
    limit = DEFAULT_PAGE_LIMIT,
    paginate = "true",
    submissionId,
    submissionTitle,
    submissionStatuses,
    submissionOwnerUsrIds,
    conferenceId,
    reviewerUsrIds,
    assignmentStatuses,
    assignedByUsrIds,
    assignedDateFrom,
    assignedDateTo,
    dueDateFrom,
    dueDateTo,
  } = req.query;

  const shouldPaginate = !/^(false|0|no)$/i.test(String(paginate));

  const assignments = await reviewAssignmentService.searchReviewAssignments(req.user, {
    page,
    limit,
    paginate: shouldPaginate,
    submissionId,
    submissionTitle,
    submissionStatuses,
    submissionOwnerUsrIds,
    conferenceId,
    reviewerUsrIds,
    assignmentStatuses,
    assignedByUsrIds,
    assignedDateFrom,
    assignedDateTo,
    dueDateFrom,
    dueDateTo,
  });

  const response = {
    success: true,
    total: assignments.total,
    data: assignments.data,
  };

  if (shouldPaginate) {
    response.page = assignments.page;
    response.limit = assignments.limit;
  }

  return res.status(200).json(response);
});

// @desc    Save review assignment status
// @route   POST /api/v1/review-assignments
// @access  Private
export const saveReviewAssignment = asyncHandler(async (req, res) => {
  const assignment = await reviewAssignmentService.saveReviewAssignment(req.user, req.body);

  return res.status(200).json({
    success: true,
    data: assignment,
  });
});

// @desc    Update review assignment status by id
// @route   PUT /api/v1/review-assignments/:id/status
// @access  Private
export const updateReviewAssignmentStatus = asyncHandler(async (req, res) => {
  const assignment = await reviewAssignmentService.updateReviewAssignmentStatusById(req.user, req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: assignment,
  });
});
