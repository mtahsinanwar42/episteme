import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createConferenceService } from "../services/conference.js";

const { Conference, File } = initModels(sequelize);
const fileService = createFileService({ File });
const conferenceService = createConferenceService({ Conference, fileService });

// @desc    Get all conferences
// @route   GET /api/v1/conferences
// @access  Private
export const getConferences = asyncHandler(async (req, res) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get conference by id
// @route   GET /api/v1/conferences/:id
// @access  Private
export const getConference = asyncHandler(async (req, res) => {
  const conference = await conferenceService.getConferenceById(req.params.id);

  return res.status(200).json({
    success: true,
    data: conference,
  });
});

// @desc    Create conference
// @route   POST /api/v1/conferences
// @access  Private
export const saveConference = asyncHandler(async (req, res) => {
  const conference = await conferenceService.createConference(req.body);

  return res.status(201).json({
    success: true,
    data: conference,
  });
});

// @desc    Update conference by id
// @route   PUT /api/v1/conferences/:id
// @access  Private
export const updateConference = asyncHandler(async (req, res) => {
  const conference = await conferenceService.updateConferenceById(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: conference,
  });
});

// @desc    Update conference status (activate/deactivate)
// @route   PUT /api/v1/conferences/:id/status
// @access  Private
export const updateConferenceStatus = asyncHandler(async (req, res) => {
  const conference = await conferenceService.updateConferenceStatusById(req.params.id, req.body.status);

  return res.status(200).json({
    success: true,
    data: conference,
  });
});
