import { USER_ROLE } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { generateContentSha256 } from "../utils/hashing.js";
import { serializeFile } from "../utils/serializers.js";

export function createFileService({ File }) {
  if (!File) {
    throw new Error("createFileService requires { File } model");
  }

  async function save(req) {
    const storageKey = req.file.path.replace(/\\/g, "/").replace(/^\/+/, "");
    const sha256 = await generateContentSha256(req.file.path);

    const file = await File.create({
      name: req.file.originalname,
      storageKey,
      size: req.file.size,
      sha256,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
    });

    return serializeFile(file);
  }

  async function checkDownloadAccess(req) {
    const storageKeyOrPath = req.query.path;
    const userId = req.user.id;
    const userRoles = req.user.roles || [];

    if (storageKeyOrPath.startsWith(process.env.FILE_STORAGE_PUBLIC_PATH)) {
      return true;
    }

    const file = await File.findOne({
      where: { storageKey: storageKeyOrPath },
    });

    if (!file) {
      throw new ErrorResponse(404, `file not found for path/storageKey: ${storageKeyOrPath}`);
    }

    const isOwner = file.uploadedBy === userId;
    const isAdmin = userRoles.includes(USER_ROLE.ADMIN);
    const isReviewer = userRoles.includes(USER_ROLE.REVIEWER);

    if (!isOwner && !isAdmin && !isReviewer) {
      throw new ErrorResponse(403, `Access denied to file: ${storageKeyOrPath}`);
    }

    return true;
  }

  async function getFileIdByPath(storageKeyOrPath, { fieldName = "file" } = {}) {
    if (!storageKeyOrPath) {
      return null;
    }

    const file = await File.findOne({
      where: { storageKey: storageKeyOrPath },
    });

    if (!file) {
      throw new ErrorResponse(404, `${fieldName} not found for path/storageKey: ${storageKeyOrPath}`);
    }

    return file.id;
  }

  async function getFilePathById(id) {
    if (!id) {
      return null;
    }

    const file = await File.findByPk(id);

    if (!file) {
      throw new ErrorResponse(404, `file not found for id: ${id}`);
    }

    return file.storageKey;
  }

  return {
    save,
    checkDownloadAccess,
    getFileIdByPath,
    getFilePathById
  };
}
