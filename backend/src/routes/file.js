import express from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import { downloadFile, uploadFile, getFile, getFiles } from "../controllers/file.js";
import { uploadMiddleware } from "../utils/file.js";
import { advancedResults } from "../middlewares/advancedResults.js";
import { initModels } from "../models/index.js";
import { sequelize } from "../config/db.js";
import { USER_ROLE } from "../utils/constants.js";

const router = express.Router();
const { File } = initModels(sequelize);

router.use(authenticate);

router
  .route('/')
  .get(authorize(USER_ROLE.ADMIN), advancedResults(File), getFiles);

router.route("/:id(\\d+)").get(getFile);

router.route("/download").get(downloadFile);
router.route("/upload/:bucket").post(uploadMiddleware.single("file"), uploadFile);

export default router;
