'use strict';

const express = require('express');
const circulationController = require('../controllers/circulationController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

// All reservation endpoints require authentication
router.use(authGuard);

/**
 * Member's own reservation list
 */
router.get('/my-reservations', roleGuard('member'), circulationController.getMyReservations);

/**
 * Staff list of all reservations
 */
router.get('/', roleGuard('librarian', 'admin'), circulationController.getReservations);

/**
 * Single reservation details
 */
router.get('/:id', circulationController.getReservationById);

/**
 * Create a new reservation (Member or Staff)
 */
router.post('/', circulationController.createReservation);

/**
 * Cancel a reservation (Member own or Staff)
 */
router.post('/:id/cancel', circulationController.cancelReservation);

module.exports = router;
