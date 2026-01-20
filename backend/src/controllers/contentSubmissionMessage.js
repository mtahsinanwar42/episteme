import asyncHandler from "express-async-handler";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createSubmissionMessageService } from "../services/contentSubmissionMessage.js";

const { ContentSubmissionMessage, File } = initModels(sequelize);
const fileService = createFileService({ File });
const submissionMessageService = createSubmissionMessageService({ ContentSubmissionMessage, fileService });

// @desc    Get submission messages by id
// @route   GET /api/v1/submissions/:id/messages
// @access  Private
export const getSubmissionMessages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const messages = await submissionMessageService.getSubmissionMessagesById(req.user, { submissionId: id });

  res.status(200).json({
    success: true,
    data: messages,
  });
});

// @desc    Get submission messages by id
// @route   POST /api/v1/submissions/:id/messages
// @access  Private
export const saveSubmissionMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const message = await submissionMessageService.saveSubmissionMessage(req.user, id, req.body);

  res.status(200).json({
    success: true,
    data: message,
  });
});
