import { Op } from "sequelize";
import ErrorResponse from "../utils/ErrorResponse.js";
import { DEFAULT_PAGE_NO, DEFAULT_PAGE_LIMIT } from "../utils/constants.js";
import { isEmpty } from "../utils/string.js";

export function createNotificationService({ Notification }) {
  if (!Notification) {
    throw new Error("createNotificationService requires { Notification } model");
  }

  async function getNotificationsByUserId(usrId, { page = DEFAULT_PAGE_NO, limit = DEFAULT_PAGE_LIMIT } = {}) {
    const safePage = Math.max(1, Number(page) || DEFAULT_PAGE_NO);
    const safeLimit = Math.max(1, Number(limit) || DEFAULT_PAGE_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await Notification.findAndCountAll({
      where: { usrId },
      order: [["createdAt", "DESC"]],
      limit: safeLimit,
      offset,
    });

    return {
      page: safePage,
      limit: safeLimit,
      total: count,
      data: rows,
    };
  }

  async function getStatusByUserId(usrId) {
    const [totalCount, unreadCount] = await Promise.all([
      Notification.count({ where: { usrId } }),
      Notification.count({ where: { usrId, isRead: false } }),
    ]);

    return {
      count: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
      }
    };
  }

  async function markAsRead(usrId, notificationIds) {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new ErrorResponse(400, "Please provide notificationIds");
    }

    const normalizedIds = notificationIds.map((id) => Number(id));
    const hasInvalidId = normalizedIds.some(
      (id) => !Number.isInteger(id) || id <= 0
    );

    if (hasInvalidId) {
      throw new ErrorResponse(400, "notificationIds must contain positive integers only");
    }

    const uniqueIds = [...new Set(normalizedIds)];

    const [updatedCount] = await Notification.update(
      { isRead: true },
      {
        where: {
          id: { [Op.in]: uniqueIds },
          usrId,
        },
      }
    );

    return { updated: updatedCount };
  }

  async function createNotification(payload) {
    const { usrId, type, title, message, resourceType, resourceId } = payload;

    if (!usrId || isEmpty(type) || isEmpty(title) || isEmpty(message)) {
      throw new ErrorResponse(400, "Please provide usrId, type, title, and message");
    }

    const [notification] = await Notification.bulkCreate([{
      usrId,
      type,
      title,
      message,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
    }], { individualHooks: true, returning: true });

    return notification;
  }

  return {
    getNotificationsByUserId,
    getStatusByUserId,
    markAsRead,
    createNotification,
  };
}
