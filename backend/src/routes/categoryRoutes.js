'use strict';

const express = require('express');
const categoryController = require('../controllers/categoryController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

/**
 * Public Routes
 */
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

/**
 * Protected Routes (Librarian, Admin only)
 */
router.post(
  '/',
  authGuard,
  roleGuard('librarian', 'admin'),
  categoryController.createCategory
);

router.put(
  '/:id',
  authGuard,
  roleGuard('librarian', 'admin'),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authGuard,
  roleGuard('librarian', 'admin'),
  categoryController.deleteCategory
);

module.exports = router;
