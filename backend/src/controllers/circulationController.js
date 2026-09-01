'use strict';

const circulationService = require('../services/circulationService');
const db = require('../config/db');
const { successResponse, paginatedResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Circulation Controller
 * Handles HTTP requests for Borrowing, Returning, and Reservation workflows
 * Reference: docs/planning/06-api-contract.md (Sections 15–17)
 */

// Helper to get member_id for current user
const getMemberIdForUser = async (userId) => {
  const [rows] = await db.query(`SELECT id FROM members WHERE user_id = ?`, [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

/**
 * ============================================================
 * BORROWING ENDPOINTS
 * ============================================================
 */

/**
 * POST /api/v1/borrowings
 * Create a new borrowing transaction
 */
const borrow = async (req, res, next) => {
  try {
    let { member_id, book_copy_id, barcode, book_id, notes } = req.body;

    // If Member role, force member_id to be their own profile ID
    if (req.user.role === 'member') {
      const ownMemberId = await getMemberIdForUser(req.user.id);
      if (!ownMemberId) {
        throw new AppError('Member profile not found for this account.', 404);
      }
      member_id = ownMemberId;
    } else {
      // Staff must supply member_id
      if (!member_id) {
        throw new AppError('Member ID is required to process borrowing.', 400, [
          { field: 'member_id', message: 'Member ID is required' },
        ]);
      }
    }

    const result = await circulationService.borrowBook({
      memberId: member_id,
      bookCopyId: book_copy_id,
      barcode,
      bookId: book_id,
      processedByUserId: req.user.id,
      notes,
    });

    return successResponse(res, result, 'Book borrowed successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/borrowings
 * List all borrowings (Librarian, Admin)
 */
const getBorrowings = async (req, res, next) => {
  try {
    const { page, limit, status, member_id, overdue_only, search } = req.query;

    const result = await circulationService.getBorrowings({
      page,
      limit,
      status,
      memberId: member_id,
      overdueOnly: overdue_only,
      search,
    });

    return paginatedResponse(
      res,
      result.borrowings,
      result.pagination,
      'Borrowing records retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/borrowings/my-borrows
 * List current member's borrowing history (Member)
 */
const getMyBorrowings = async (req, res, next) => {
  try {
    const ownMemberId = await getMemberIdForUser(req.user.id);
    if (!ownMemberId) {
      throw new AppError('Member profile not found.', 404);
    }

    const { page, limit, status, overdue_only, search } = req.query;

    const result = await circulationService.getBorrowings({
      page,
      limit,
      status,
      memberId: ownMemberId,
      overdueOnly: overdue_only,
      search,
    });

    return paginatedResponse(
      res,
      result.borrowings,
      result.pagination,
      'My borrowing history retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/borrowings/:id
 * Get single borrowing details
 */
const getBorrowingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
         b.id,
         b.borrowing_code,
         b.member_id,
         m.member_code,
         m.user_id AS member_user_id,
         m.first_name AS member_first_name,
         m.last_name AS member_last_name,
         b.book_copy_id,
         bc.barcode,
         bk.id AS book_id,
         bk.title AS book_title,
         bk.author AS book_author,
         bk.cover_image_url AS book_cover_image,
         b.borrow_date,
         b.due_date,
         b.return_date,
         b.status,
         b.processed_by,
         u_proc.username AS processed_by_username,
         b.returned_to_user_id,
         u_ret.username AS returned_to_username,
         b.notes,
         b.created_at,
         f.id AS fine_id,
         f.fine_code,
         f.amount AS fine_amount,
         f.status AS fine_status
       FROM borrowings b
       JOIN members m ON b.member_id = m.id
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       LEFT JOIN users u_proc ON b.processed_by = u_proc.id
       LEFT JOIN users u_ret ON b.returned_to_user_id = u_ret.id
       LEFT JOIN fines f ON b.id = f.borrowing_id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new AppError('Borrowing record not found', 404);
    }

    const borrowing = rows[0];

    // IDOR check: Members can only see their own borrowing details
    if (req.user.role === 'member' && borrowing.member_user_id !== req.user.id) {
      throw new AppError('Forbidden: You can only view your own borrowing records.', 403);
    }

    return successResponse(res, borrowing, 'Borrowing details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * RETURN ENDPOINT
 * ============================================================
 */

/**
 * POST /api/v1/borrowings/:id/return
 * Process book return (Librarian, Admin)
 */
const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { return_date, notes } = req.body;

    const result = await circulationService.returnBook({
      borrowingId: id,
      returnedToUserId: req.user.id,
      returnDate: return_date || null,
      notes: notes || null,
    });

    return successResponse(res, result, 'Book return processed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================
 * RESERVATION ENDPOINTS
 * ============================================================
 */

/**
 * POST /api/v1/reservations
 * Create a new book reservation
 */
const createReservation = async (req, res, next) => {
  try {
    let { book_id, member_id } = req.body;

    if (!book_id) {
      throw new AppError('Book ID is required to place a reservation.', 400, [
        { field: 'book_id', message: 'Book ID is required' },
      ]);
    }

    // If Member role, force member_id to be their own profile ID
    if (req.user.role === 'member') {
      const ownMemberId = await getMemberIdForUser(req.user.id);
      if (!ownMemberId) {
        throw new AppError('Member profile not found for this account.', 404);
      }
      member_id = ownMemberId;
    } else {
      if (!member_id) {
        throw new AppError('Member ID is required to place a reservation.', 400, [
          { field: 'member_id', message: 'Member ID is required' },
        ]);
      }
    }

    const result = await circulationService.createReservation({
      memberId: member_id,
      bookId: book_id,
    });

    return successResponse(res, result, 'Book reservation placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reservations
 * List all reservations in system (Librarian, Admin)
 */
const getReservations = async (req, res, next) => {
  try {
    const { page, limit, status, member_id, book_id, search } = req.query;

    const result = await circulationService.getReservations({
      page,
      limit,
      status,
      memberId: member_id,
      bookId: book_id,
      search,
    });

    return paginatedResponse(
      res,
      result.reservations,
      result.pagination,
      'Reservations retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reservations/my-reservations
 * List current member's reservations (Member)
 */
const getMyReservations = async (req, res, next) => {
  try {
    const ownMemberId = await getMemberIdForUser(req.user.id);
    if (!ownMemberId) {
      throw new AppError('Member profile not found.', 404);
    }

    const { page, limit, status, search } = req.query;

    const result = await circulationService.getReservations({
      page,
      limit,
      status,
      memberId: ownMemberId,
      search,
    });

    return paginatedResponse(
      res,
      result.reservations,
      result.pagination,
      'My reservations retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reservations/:id
 * Get single reservation details
 */
const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
         r.id,
         r.reservation_code,
         r.member_id,
         m.member_code,
         m.user_id AS member_user_id,
         m.first_name AS member_first_name,
         m.last_name AS member_last_name,
         r.book_id,
         b.title AS book_title,
         b.author AS book_author,
         b.cover_image_url AS book_cover_image,
         r.queue_number,
         r.reservation_date,
         r.status,
         r.hold_until_date,
         r.allocated_copy_id,
         bc.barcode AS allocated_barcode,
         r.created_at,
         r.updated_at
       FROM reservations r
       JOIN members m ON r.member_id = m.id
       JOIN books b ON r.book_id = b.id
       LEFT JOIN book_copies bc ON r.allocated_copy_id = bc.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new AppError('Reservation record not found', 404);
    }

    const reservation = rows[0];

    // IDOR check: Member can only view own reservation
    if (req.user.role === 'member' && reservation.member_user_id !== req.user.id) {
      throw new AppError('Forbidden: You can only view your own reservations.', 403);
    }

    return successResponse(res, reservation, 'Reservation details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/reservations/:id/cancel
 * Cancel a reservation (Member own, Librarian, Admin)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await circulationService.cancelReservation({
      reservationId: id,
      reqUser: req.user,
    });

    return successResponse(res, result, 'Reservation cancelled successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrow,
  getBorrowings,
  getMyBorrowings,
  getBorrowingById,
  returnBook,
  createReservation,
  getReservations,
  getMyReservations,
  getReservationById,
  cancelReservation,
};
