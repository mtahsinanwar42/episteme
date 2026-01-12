import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { downloadFile, uploadFile, getFile } from "../controllers/file.js";
import { uploadMiddleware } from "../utils/file.js";

const router = express.Router();

router.use(authenticate);

router.route("/:id(\\d+)").get(getFile);

router.route("/download").get(downloadFile);
router.route("/upload/:bucket").post(uploadMiddleware.single("file"), uploadFile);

export default router;
