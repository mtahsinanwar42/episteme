import asyncHandler from "express-async-handler";
import { isEmpty } from "../utils/string.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";

const { File } = initModels(sequelize);
const fileService = createFileService({ File });

// @desc    Get Files
// @route   GET /api/v1/files
// @access  Private
export const getFiles = asyncHandler(async (req, res) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get File by id
// @route   GET /api/v1/files/:id
// @access  Private
export const getFile = asyncHandler(async (req, res, next) => {
  const file = await fileService.getFile(req);

  return res.status(200).json({
    success: true,
    data: file,
  });
});


// @ desc   Download File
// @ route  GET /api/v1/files/download?path=...
// @ access Private
export const downloadFile = asyncHandler(async (req, res, next) => {
  const filePath = req.query.path;

  if (isEmpty(filePath)) {
    return next(new ErrorResponse(400, "path must be present in payload"));
  }

  const file = await fileService.getFile(req);

  return res.download(filePath);
});

// @ desc   Upload File (bucketed)
// @ route  POST /api/v1/files/upload/:bucket
// @ access Private
export const uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse(400, "No file uploaded. Expected form-data field: 'file'"));
  }

  const file = await fileService.save(req);

  return res.status(200).json({
    success: true,
    data: {
      bucket: req.params.bucket,
      file,
    },
  });
});
