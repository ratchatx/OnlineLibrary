'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const authGuard = require('../middlewares/authGuard');
const { authRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Public Authentication Routes (Protected by Auth Rate Limiter)
 */
router.post('/login', authRateLimiter, authController.login);

/**
 * Protected Authentication Routes (Require valid JWT)
 */
router.post('/logout', authGuard, authController.logout);
router.get('/me', authGuard, authController.getMe);
router.put('/change-password', authGuard, authController.changePassword);

module.exports = router;
