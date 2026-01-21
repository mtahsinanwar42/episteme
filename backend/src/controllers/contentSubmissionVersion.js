import asyncHandler from "express-async-handler";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createSubmissionVersionService } from "../services/contentSubmissionVersion.js";

const { ContentSubmissionVersion, ContentSubmission, File } = initModels(sequelize);
const fileService = createFileService({ File });
const submissionVersionService = createSubmissionVersionService({ ContentSubmissionVersion, ContentSubmission, fileService });

// @desc    Get submission versions by id
// @route   GET /api/v1/submissions/:id/versions
// @access  Private
export const getSubmissionVersions = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const versions = await submissionVersionService.getSubmissionVersionsById(req.user, { submissionId: id });

  res.status(200).json({
    success: true,
    data: versions,
  });
});

// @desc    Save submission version
// @route   POST /api/v1/submissions/:id/versions
// @access  Private
export const saveSubmissionVersion = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const version = await submissionVersionService.saveSubmissionVersion(req.user, id, req.body);

  res.status(200).json({
    success: true,
    data: version,
  });
});
