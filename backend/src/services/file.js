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

  async function getAccessCheckedFile(req) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    const fileIdParam = req.params?.id;
    const storageKeyOrPath = req.query?.path;

    if (!fileIdParam && !storageKeyOrPath) {
      throw new ErrorResponse(400, "Provide req.params.id for /files/:id or req.query.path for /files/download");
    }

    if (storageKeyOrPath
      && process.env.FILE_STORAGE_PUBLIC_PATH
      && storageKeyOrPath.startsWith(process.env.FILE_STORAGE_PUBLIC_PATH)) {

      return null;
    }

    const file = fileIdParam
      ? await File.findByPk(fileIdParam)
      : await File.findOne({ where: { storageKey: storageKeyOrPath } });

    if (!file) {
      throw new ErrorResponse(
        404,
        fileIdParam ? `file not found for id: ${fileIdParam}` : `file not found for path/storageKey: ${storageKeyOrPath}`
      );
    }

    if (process.env.FILE_STORAGE_PUBLIC_PATH
      && typeof file.storageKey === "string"
      && file.storageKey.startsWith(process.env.FILE_STORAGE_PUBLIC_PATH)) {

      return file;
    }

    if (!userId) {
      throw new ErrorResponse(401, "Not Authorized");
    }

    const isOwner = Number(file.uploadedBy) === Number(userId);
    const isAdmin = userRoles.includes(USER_ROLE.ADMIN);
    const isReviewer = userRoles.includes(USER_ROLE.REVIEWER);

    if (!isOwner && !isAdmin && !isReviewer) {
      throw new ErrorResponse(
        403,
        fileIdParam
          ? `Access denied to file id: ${fileIdParam}`
          : `Access denied to file: ${storageKeyOrPath}`
      );
    }

    return file;
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
    getAccessCheckedFile,
    getFileIdByPath,
    getFilePathById,
  };
}
