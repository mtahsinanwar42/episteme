import express from 'express';
import { getActivities, saveActivity, getActivity, updateActivity } from '../controllers/activity.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { advancedResults } from '../middlewares/advancedResults.js';
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { USER_ROLE } from '../utils/constants.js';
import { serializeActivity } from '../utils/serializers.js';

const router = express.Router();
const { Activity, File } = initModels(sequelize);

router
  .route('/')
  .get(
    advancedResults(Activity, {
      include: [
        { model: File, as: "metadataFile", attributes: ["id", "storageKey"] },
      ],
      transform: (rows, { req }) => rows.map(r => {
        let metadataFileStorageKey = undefined;
        if (!req.query.select || req.query.select.includes('metadataFilePath')) {
          metadataFileStorageKey = r.metadataFile?.storageKey;
        }

        return serializeActivity(r, metadataFileStorageKey);
      }),
    }),
    getActivities
  );

router
  .route('/:id')
  .get(getActivity);

router.route('/')
  .post(authenticate, authorize(USER_ROLE.ADMIN), saveActivity);

router
  .route('/:id')
  .put(authenticate, authorize(USER_ROLE.ADMIN), updateActivity);

export default router;
