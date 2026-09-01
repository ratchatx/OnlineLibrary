'use strict';

const express = require('express');
const reportController = require('../controllers/reportController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

// All operational reports are for Staff (Librarian, Admin)
router.use(authGuard, roleGuard('librarian', 'admin'));

router.get('/borrow-return', reportController.getBorrowReturnReport);
router.get('/overdue-fines', reportController.getOverdueFinesReport);
router.get('/popular-books', reportController.getPopularBooksReport);

module.exports = router;
