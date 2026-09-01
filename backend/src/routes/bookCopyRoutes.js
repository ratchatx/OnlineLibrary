'use strict';

const express = require('express');
const bookCopyController = require('../controllers/bookCopyController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

/**
 * All copy management routes are protected (Librarian, Admin only)
 */
router.use(authGuard, roleGuard('librarian', 'admin'));

router.get('/barcode/:barcode', bookCopyController.getCopyByBarcode);
router.patch('/:id/status', bookCopyController.updateCopyStatus);
router.delete('/:id', bookCopyController.deleteCopy);

module.exports = router;
