import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createFileService } from "../services/file.js";
import { createAnnouncementService } from "../services/announcement.js";

const { Announcement, File } = initModels(sequelize);
const fileService = createFileService({ File });
const announcementService = createAnnouncementService({ Announcement, fileService });

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Private
export const getAnnouncements = asyncHandler(async (req, res) => {
  return res.status(200).json(res.advancedResults);
});

// @desc    Get announcement by id
// @route   GET /api/v1/announcements/:id
// @access  Private
export const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.getAnnouncementById(req.params.id);

  return res.status(200).json({
    success: true,
    data: announcement,
  });
});

// @desc    Create announcement
// @route   POST /api/v1/announcements
// @access  Private
export const saveAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement(req.body);

  return res.status(201).json({
    success: true,
    data: announcement,
  });
});

// @desc    Update announcement by id
// @route   PUT /api/v1/announcements/:id
// @access  Private
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncementById(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: announcement,
  });
});
