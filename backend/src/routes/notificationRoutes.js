'use strict';

const express = require('express');
const notificationController = require('../controllers/notificationController');
const authGuard = require('../middlewares/authGuard');

const router = express.Router();

// All notification routes require authentication
router.use(authGuard);

/**
 * Get current user's notifications
 */
router.get('/', notificationController.getNotifications);

/**
 * Mark all notifications as read
 */
router.patch('/read-all', notificationController.markAllAsRead);

/**
 * Mark a single notification as read
 */
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
