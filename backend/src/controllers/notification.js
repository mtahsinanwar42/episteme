import asyncHandler from "express-async-handler";

import { sequelize } from "../config/db.js";
import { initModels } from "../models/index.js";
import { createNotificationService } from "../services/notification.js";
import { DEFAULT_PAGE_NO, DEFAULT_PAGE_LIMIT } from "../utils/constants.js";

const { Notification } = initModels(sequelize);
const notificationService = createNotificationService({ Notification });

// @desc    Get notifications for current user
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = DEFAULT_PAGE_NO, limit = DEFAULT_PAGE_LIMIT } = req.query;

  const result = await notificationService.getNotificationsByUserId(req.user.id, { page, limit });

  return res.status(200).json({
    success: true,
    page: result.page,
    limit: result.limit,
    total: result.total,
    data: result.data,
  });
});

// @desc    Get notification status metadata for current user
// @route   GET /api/v1/notifications/status
// @access  Private
export const getStatus = asyncHandler(async (req, res) => {
  const result = await notificationService.getStatusByUserId(req.user.id);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Mark notifications as read
// @route   POST /api/v1/notifications/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  const result = await notificationService.markAsRead(req.user.id, notificationIds);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Create a notification
// @route   POST /api/v1/notifications
// @access  Private (Admin)
export const saveNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);

  return res.status(201).json({
    success: true,
    data: notification,
  });
});
