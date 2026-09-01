'use strict';

const notificationModel = require('../models/notificationModel');
const { successResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Notification Controller
 * Reference: docs/planning/06-api-contract.md (Section 19)
 */

/**
 * GET /api/v1/notifications
 * List notifications for current user with unread count
 */
const getNotifications = async (req, res, next) => {
  try {
    const { is_read, page, limit } = req.query;

    const result = await notificationModel.findByUserId(req.user.id, {
      is_read,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      unread_count: result.unread_count,
      pagination: {
        total_records: result.pagination.totalRecords,
        current_page: result.pagination.currentPage,
        total_pages: Math.ceil(result.pagination.totalRecords / result.pagination.limit),
        limit: result.pagination.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await notificationModel.findById(id);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== req.user.id) {
      throw new AppError('Forbidden: You can only update your own notifications.', 403);
    }

    await notificationModel.markAsRead(id, req.user.id);

    const updated = await notificationModel.findById(id);

    return successResponse(res, updated, 'Notification marked as read', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read for current user
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const count = await notificationModel.markAllAsRead(req.user.id);

    return successResponse(res, { updated_count: count }, 'All notifications marked as read', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
