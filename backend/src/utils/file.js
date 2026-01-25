import fs from "fs";
import path from "path";
import multer from "multer";
import ErrorResponse from "./ErrorResponse.js";
import { slugify } from "./string.js";
import { currentTimestamp } from "./dateTime.js";
import { FILE_BUCKETS } from "./constants.js";
import { generateHash } from "./hashing.js";

export function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

let baseDirEnsured = false;

function ensureBaseDirOnce() {
  if (baseDirEnsured) {
    return;
  }

  const baseDir = process.env.FILE_STORAGE_PATH;

  if (!baseDir) {
    throw new ErrorResponse(500, "FILE_STORAGE_PATH env is not set");
  }

  ensureDirSync(baseDir);
  baseDirEnsured = true;
}

function getBucketFromReq(req) {
  const bucket = String(req.params.bucket || "").trim().toLowerCase();

  if (!bucket) {
    throw new ErrorResponse(400, "bucket must be present in URL");
  }

  if (!FILE_BUCKETS[bucket]) {
    throw new ErrorResponse(400, `Invalid bucket '${bucket}'. Allowed: ${Object.keys(FILE_BUCKETS).join(", ")}`);
  }

  return bucket;
}

function buildStoredFilename(originalName) {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);

  const safeBase = slugify(`${nameWithoutExt}_${generateHash(nameWithoutExt).slice(0, 8)}`);
  const ts = currentTimestamp();

  return `${safeBase}_${ts}${ext.toLowerCase()}`;
}

ensureBaseDirOnce();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const baseDir = process.env.FILE_STORAGE_PATH;

      if (!baseDir) {
        return cb(new ErrorResponse(500, "FILE_STORAGE_PATH env is not set"));
      }

      const bucket = getBucketFromReq(req);
      const targetDir = path.join(baseDir, `${FILE_BUCKETS[bucket].visibility}/${bucket}`);

      ensureDirSync(targetDir);
      cb(null, targetDir);
    } catch (err) {
      cb(err);
    }
  },

  filename(req, file, cb) {
    cb(null, buildStoredFilename(file.originalname));
  },
});

const checkFileType = async (req, file, cb) => {
  try {
    const bucket = getBucketFromReq(req);
    const supportedFileTypes = FILE_BUCKETS[bucket].types;
    const supportedFileSize = FILE_BUCKETS[bucket].maxSize;
    const fileExt = path.extname(file.originalname).toLowerCase().replace(".", "");
    const isValidFileType = supportedFileTypes.test(fileExt);

    const fileSize = parseInt(req.headers["content-length"] || "0", 10);
    const isFileSizeNotExceeded = Number.isFinite(fileSize) ? fileSize <= supportedFileSize : true;

    const baseDir = process.env.FILE_STORAGE_PATH;
    const targetDir = path.join(baseDir, `${FILE_BUCKETS[bucket].visibility}/${bucket}`);
    ensureDirSync(targetDir);

    if (isValidFileType && isFileSizeNotExceeded) {
      return cb(null, true);
    }

    return cb(new ErrorResponse(400, `Invalid file type or file size exceeded for bucket '${bucket}'. Allowed types: ${supportedFileTypes}, Max size: ${supportedFileSize} bytes`));
  } catch (err) {
    return cb(err);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(req, file, cb);
  },
});

export const getFileListByDirectory = (directory) => {
  try {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs.readdirSync(directory) || [];
  } catch {
    return [];
  }
};

export const resolveInDir = (dirPath, fileName) => {
  return path.join(dirPath, fileName);
};

export const readLinesIfExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
};

export const writeLines = (filePath, lines) => {
  const cleaned = lines.map((x) => String(x).trim()).filter(Boolean);

  const unique = Array.from(new Set(cleaned));

  fs.writeFileSync(filePath, unique.join("\n") + "\n", "utf8");
  return unique;
};

export const getPublicAssetsDiskDir = () => {
  const projectRoot = path.resolve();
  const publicAssetsPath = process.env.FILE_STORAGE_PUBLIC_ASSETS_PATH || "/storage/public/assets";

  const publicAssetsRel = publicAssetsPath.replace(/^[\\/]+/, "");
  const normalizedPublicAssetsRel = publicAssetsRel.replace(/[\\/]+$/, "");

  return path.join(projectRoot, normalizedPublicAssetsRel);
}
