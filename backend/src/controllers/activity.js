import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createActivityService } from "../services/activity.js";

const { Activity, File } = initModels(sequelize);
const fileService = createFileService({ File });
const activityService = createActivityService({ Activity, fileService });

// @desc    Get all activities
// @route   GET /api/v1/activities
// @access  Private
export const getActivities = asyncHandler(async (req, res) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get activity by id
// @route   GET /api/v1/activities/:id
// @access  Private
export const getActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.getActivityById(req.params.id);

  return res.status(200).json({
    success: true,
    data: activity,
  });
});

// @desc    Create activity
// @route   POST /api/v1/activities
// @access  Private
export const saveActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.createActivity(req.body);

  return res.status(201).json({
    success: true,
    data: activity,
  });
});

// @desc    Update activity by id
// @route   PUT /api/v1/activities/:id
// @access  Private
export const updateActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.updateActivityById(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: activity,
  });
});
