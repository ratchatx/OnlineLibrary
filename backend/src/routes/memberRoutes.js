'use strict';

const express = require('express');
const memberController = require('../controllers/memberController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

// All member endpoints require authentication
router.use(authGuard);

/**
 * Staff Member Directory (/api/v1/members)
 */
router.get('/', roleGuard('librarian', 'admin'), memberController.getMembers);

/**
 * Member Profile Details & Update
 */
router.get('/:id', memberController.getMemberById);
router.put('/:id', memberController.updateMember);

/**
 * Member Activity & History Endpoints
 */
router.get('/:id/borrowings', memberController.getMemberBorrowings);
router.get('/:id/reservations', memberController.getMemberReservations);
router.get('/:id/fines', memberController.getMemberFines);

module.exports = router;
