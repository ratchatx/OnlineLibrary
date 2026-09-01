'use strict';

const express = require('express');
const circulationController = require('../controllers/circulationController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

// All borrowing endpoints require authentication
router.use(authGuard);

/**
 * Member's own borrowing history
 */
router.get('/my-borrows', roleGuard('member'), circulationController.getMyBorrowings);

/**
 * Staff list of all borrowings
 */
router.get('/', roleGuard('librarian', 'admin'), circulationController.getBorrowings);

/**
 * Single borrowing details
 */
router.get('/:id', circulationController.getBorrowingById);

/**
 * Create a new borrowing transaction (Member self-checkout or Staff counter checkout)
 */
router.post('/', circulationController.borrow);

/**
 * Process book return (Librarian, Admin only)
 */
router.post('/:id/return', roleGuard('librarian', 'admin'), circulationController.returnBook);

module.exports = router;
