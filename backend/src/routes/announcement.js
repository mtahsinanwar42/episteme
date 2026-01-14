import express from 'express';
import { getAnnouncements, saveAnnouncement, getAnnouncement, updateAnnouncement } from '../controllers/announcement.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { advancedResults } from '../middlewares/advancedResults.js';
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { USER_ROLE } from '../utils/constants.js';
import { serializeAnnouncement } from '../utils/serializers.js';

const router = express.Router();
const { Announcement, File } = initModels(sequelize);

router
  .route('/')
  .get(
    advancedResults(Announcement, {
      include: [
        { model: File, as: "metadataFile", attributes: ["id", "storageKey"] },
      ],
      transform: (rows, { req }) => rows.map(r => {
        let metadataFileStorageKey = undefined;
        if (!req.query.select || req.query.select.includes('metadataFilePath')) {
          metadataFileStorageKey = r.metadataFile?.storageKey;
        }

        return serializeAnnouncement(r, metadataFileStorageKey);
      }),
    }),
    getAnnouncements
  );

router
  .route('/:id')
  .get(getAnnouncement);

router.route('/')
  .post(authenticate, authorize(USER_ROLE.ADMIN), saveAnnouncement);

router
  .route('/:id')
  .put(authenticate, authorize(USER_ROLE.ADMIN), updateAnnouncement);

export default router;
