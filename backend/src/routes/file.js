import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { download, uploadFile } from "../controllers/file.js";
import { uploadMiddleware } from "../utils/file.js";

const router = express.Router();

router.use(authenticate);

router.route("/download").get(download);
router.route("/upload/:bucket").post(uploadMiddleware.single("file"), uploadFile);

export default router;
