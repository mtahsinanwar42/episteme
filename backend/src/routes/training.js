import express from 'express';
import { getTrainings, saveTraining, getTraining, updateTraining } from '../controllers/training.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { advancedResults } from '../middlewares/advancedResults.js';
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { USER_ROLE } from '../utils/constants.js';
import { serializeTraining } from '../utils/serializers.js';

const router = express.Router();
const { Training, File } = initModels(sequelize);

router
  .route('/')
  .get(
    advancedResults(Training, {
      include: [
        { model: File, as: "metadataFile", attributes: ["id", "storageKey"] },
      ],
      transform: (rows, { req }) => rows.map(r => {
        let metadataFileStorageKey = undefined;
        if (!req.query.select || req.query.select.includes('metadataFilePath')) {
          metadataFileStorageKey = r.metadataFile?.storageKey;
        }

        return serializeTraining(r, metadataFileStorageKey);
      }),
    }),
    getTrainings
  );

router
  .route('/:id')
  .get(getTraining);

router.route('/')
  .post(authenticate, authorize(USER_ROLE.ADMIN), saveTraining);

router
  .route('/:id')
  .put(authenticate, authorize(USER_ROLE.ADMIN), updateTraining);

export default router;
