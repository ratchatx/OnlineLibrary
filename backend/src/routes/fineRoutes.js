'use strict';

const express = require('express');
const fineController = require('../controllers/fineController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

// All fine routes require authentication
router.use(authGuard);

/**
 * Member's own fines list
 */
router.get('/my-fines', roleGuard('member'), fineController.getMyFines);

/**
 * Staff fine list
 */
router.get('/', roleGuard('librarian', 'admin'), fineController.getFines);

/**
 * Single fine details
 */
router.get('/:id', fineController.getFineById);

/**
 * Record fine payment (Librarian, Admin)
 */
router.post('/:id/pay', roleGuard('librarian', 'admin'), fineController.payFine);

/**
 * Waive fine (Admin only)
 */
router.post('/:id/waive', roleGuard('admin'), fineController.waiveFine);

module.exports = router;
