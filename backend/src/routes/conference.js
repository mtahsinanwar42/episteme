import express from 'express';
import { getConferences, saveConference, getConference, updateConference, updateConferenceStatus } from '../controllers/conference.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { advancedResults } from '../middlewares/advancedResults.js';
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { USER_ROLE } from '../utils/constants.js';
import { serializeConference } from '../utils/serializers.js';

const router = express.Router();
const { Conference, File } = initModels(sequelize);

router.use(authenticate);
router.use(authorize(USER_ROLE.ADMIN));

router
  .route('/')
  .get(
    advancedResults(Conference, {
      include: [
        { model: File, as: "metadataFile", attributes: ["id", "storageKey"] },
      ],
      transform: (rows, { req }) => rows.map(r => {
        let metadataFileStorageKey = undefined;
        if (!req.query.select || req.query.select.includes('metadataFilePath')) {
          metadataFileStorageKey = r.metadataFile?.storageKey;
        }

        return serializeConference(r, metadataFileStorageKey);
      }),
    }),
    getConferences
  )
  .post(saveConference);

router
  .route('/:id')
  .get(getConference)
  .put(updateConference)

router
  .route("/:id/status")
  .put(updateConferenceStatus);

export default router;
