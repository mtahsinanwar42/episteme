import express from 'express';
import { getCountries, getTopics } from '../controllers/referenceData.js';

const router = express.Router();

router
  .route('/topics')
  .get(getTopics);

router
  .route('/countries')
  .get(getCountries);

export default router;
