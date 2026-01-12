import express from 'express';
import { getUsers, getUser, saveUser, updateUser, updateUserStatus } from '../controllers/user.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { advancedResults } from '../middlewares/advancedResults.js';
import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { USER_ROLE } from '../utils/constants.js';
import { serializeUser } from '../utils/serializers.js';

const router = express.Router();
const { User, File } = initModels(sequelize);

router.use(authenticate);
router.use(authorize(USER_ROLE.ADMIN));

router
  .route('/')
  .get(
    advancedResults(User, {
      include: [
        { model: File, as: "cvFile", attributes: ["id", "storageKey"] },
        { model: File, as: "photoFile", attributes: ["id", "storageKey"] },
      ],
      transform: (rows, { req }) => rows.map(r => {
        let cvFileStorageKey = undefined;
        let photoFileStorageKey = undefined;

        if (!req.query.select || req.query.select.includes('cvFilePath')) {
          cvFileStorageKey = r.cvFile?.storageKey;
        }

        if (!req.query.select || req.query.select.includes('photoFilePath')) {
          photoFileStorageKey = r.photoFile?.storageKey;
        }

        return serializeUser(r, cvFileStorageKey, photoFileStorageKey);
      }),
    }),
    getUsers
  )
  .post(saveUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)

router
  .route("/:id/status")
  .put(updateUserStatus);

export default router;
