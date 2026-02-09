import path from "path";
import { USER_ROLE } from "../utils/constants.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { generateContentSha256 } from "../utils/hashing.js";
import { serializeFile } from "../utils/serializers.js";

export function createFileService({ File }) {
  if (!File) {
    throw new Error("createFileService requires { File } model");
  }

  function deriveStorageKey(filePath) {
    const normalizedPath = String(filePath || "").replace(/\\/g, "/");
    if (!normalizedPath) {
      return normalizedPath;
    }

    const storageMatch = normalizedPath.match(/(?:^|\/)(storage\/.+)$/);
    if (storageMatch?.[1]) {
      return storageMatch[1].replace(/^\/+/, "");
    }

    if (!path.isAbsolute(filePath)) {
      return normalizedPath.replace(/^\.?\//, "").replace(/^\/+/, "");
    }

    const baseDir = process.env.FILE_STORAGE_PATH;
    if (!baseDir) {
      return normalizedPath.replace(/^\/+/, "");
    }

    const resolvedBaseDir = path.resolve(baseDir);
    const resolvedFilePath = path.resolve(filePath);
    const baseParent = path.dirname(resolvedBaseDir);
    const relFromBaseParent = path.relative(baseParent, resolvedFilePath).replace(/\\/g, "/");

    if (relFromBaseParent && !relFromBaseParent.startsWith("..")) {
      return relFromBaseParent.replace(/^\/+/, "");
    }

    return normalizedPath.replace(/^\/+/, "");
  }

  async function save(req) {
    const storageKey = deriveStorageKey(req.file.path);
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

  async function getFile(req) {
    const fileIdParam = req.params?.id;
    const storageKeyOrPath = req.query?.path;

    if (!fileIdParam && !storageKeyOrPath) {
      throw new ErrorResponse(400, "Provide req.params.id for /files/:id or req.query.path for /files/download");
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
    getFile,
    getFileIdByPath,
    getFilePathById,
  };
}
