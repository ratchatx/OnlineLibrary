'use strict';

const express = require('express');
const bookController = require('../controllers/bookController');
const bookCopyController = require('../controllers/bookCopyController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

/**
 * Public Routes
 */
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

/**
 * Protected Book Routes (Librarian, Admin only)
 */
router.post(
  '/',
  authGuard,
  roleGuard('librarian', 'admin'),
  bookController.createBook
);

router.put(
  '/:id',
  authGuard,
  roleGuard('librarian', 'admin'),
  bookController.updateBook
);

router.delete(
  '/:id',
  authGuard,
  roleGuard('librarian', 'admin'),
  bookController.deleteBook
);

/**
 * Nested Physical Copies Routes (/api/v1/books/:book_id/copies)
 */
router.get(
  '/:book_id/copies',
  authGuard,
  roleGuard('librarian', 'admin'),
  bookCopyController.getCopiesByBookId
);

router.post(
  '/:book_id/copies',
  authGuard,
  roleGuard('librarian', 'admin'),
  bookCopyController.addCopy
);

module.exports = router;
