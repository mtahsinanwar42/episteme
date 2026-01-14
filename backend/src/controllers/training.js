import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createTrainingService } from "../services/training.js";

const { Training, File } = initModels(sequelize);
const fileService = createFileService({ File });
const trainingService = createTrainingService({ Training, fileService });

// @desc    Get all trainings
// @route   GET /api/v1/trainings
// @access  Private
export const getTrainings = asyncHandler(async (req, res) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get training by id
// @route   GET /api/v1/trainings/:id
// @access  Private
export const getTraining = asyncHandler(async (req, res) => {
  const training = await trainingService.getTrainingById(req.params.id);

  return res.status(200).json({
    success: true,
    data: training,
  });
});

// @desc    Create training
// @route   POST /api/v1/trainings
// @access  Private
export const saveTraining = asyncHandler(async (req, res) => {
  const training = await trainingService.createTraining(req.body);

  return res.status(201).json({
    success: true,
    data: training,
  });
});

// @desc    Update training by id
// @route   PUT /api/v1/trainings/:id
// @access  Private
export const updateTraining = asyncHandler(async (req, res) => {
  const training = await trainingService.updateTrainingById(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: training,
  });
});
