import express from 'express';
import { getBlogs, saveBlog, getBlog, updateBlog } from '../controllers/blog.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { advancedResults } from '../middlewares/advancedResults.js';
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { USER_ROLE } from '../utils/constants.js';
import { serializeBlog } from '../utils/serializers.js';

const router = express.Router();
const { Blog, File } = initModels(sequelize);

router
  .route('/')
  .get(
    advancedResults(Blog, {
      include: [
        { model: File, as: "metadataFile", attributes: ["id", "storageKey"] },
      ],
      transform: (rows, { req }) => rows.map(r => {
        let metadataFileStorageKey = undefined;
        if (!req.query.select || req.query.select.includes('metadataFilePath')) {
          metadataFileStorageKey = r.metadataFile?.storageKey;
        }

        return serializeBlog(r, metadataFileStorageKey);
      }),
    }),
    getBlogs
  );

router
  .route('/:id')
  .get(getBlog);

router.route('/')
  .post(authenticate, authorize(USER_ROLE.ADMIN), saveBlog);

router
  .route('/:id')
  .put(authenticate, authorize(USER_ROLE.ADMIN), updateBlog);

export default router;
