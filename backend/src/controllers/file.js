import asyncHandler from "express-async-handler";
import { isEmpty } from "../utils/string.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";

const { File } = initModels(sequelize);
const fileService = createFileService({ File });

// @ desc   Download File
// @ route  GET /api/v1/file/download?path=...
// @ access Private
export const download = asyncHandler(async (req, res, next) => {
  const filePath = req.query.path;

  if (isEmpty(filePath)) {
    return next(new ErrorResponse(400, "path must be present in payload"));
  }

  await fileService.checkDownloadAccess(req);

  return res.download(filePath);
});

// @ desc   Upload File (bucketed)
// @ route  POST /api/v1/file/upload/:bucket
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
