'use strict';

const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

router.use(authGuard);

/**
 * Staff Operational Dashboard Summary (Librarian, Admin)
 */
router.get(
  '/staff-summary',
  roleGuard('librarian', 'admin'),
  dashboardController.getStaffSummary
);

/**
 * Member Personal Dashboard Summary (Member)
 */
router.get(
  '/member-summary',
  roleGuard('member'),
  dashboardController.getMemberSummary
);

module.exports = router;
