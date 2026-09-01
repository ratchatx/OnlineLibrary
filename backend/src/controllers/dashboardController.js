'use strict';

const db = require('../config/db');
const { successResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Dashboard Controller
 * Reference: docs/planning/06-api-contract.md (Section 20)
 */

/**
 * GET /api/v1/dashboard/staff-summary
 * Aggregates 11 Operational KPIs for Librarians & Administrators
 */
const getStaffSummary = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // 1. Core KPIs
    const [kpiRows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM books WHERE deleted_at IS NULL) AS total_books,
        (SELECT COUNT(*) FROM book_copies) AS total_copies,
        (SELECT COUNT(*) FROM book_copies WHERE status = 'available') AS available_copies,
        (SELECT COUNT(*) FROM members WHERE membership_status = 'active') AS total_members,
        (SELECT COUNT(*) FROM borrowings WHERE status IN ('borrowed', 'overdue')) AS active_borrows,
        (SELECT COUNT(*) FROM borrowings WHERE DATE(created_at) = CURDATE()) AS today_borrows,
        (SELECT COUNT(*) FROM borrowings WHERE status = 'returned' AND DATE(return_date) = CURDATE()) AS today_returns,
        (SELECT COUNT(*) FROM borrowings WHERE status = 'overdue' OR (status = 'borrowed' AND due_date < CURDATE())) AS overdue_count,
        (SELECT COUNT(*) FROM reservations WHERE status = 'pending') AS pending_reservations,
        (SELECT COUNT(*) FROM reservations WHERE status = 'available') AS available_reservations_holding,
        (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE status = 'unpaid') AS total_unpaid_fines,
        (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE status = 'paid' AND MONTH(paid_at) = MONTH(CURDATE()) AND YEAR(paid_at) = YEAR(CURDATE())) AS monthly_collected_fines
    `);

    const kpis = kpiRows[0];

    // 2. Recent Borrowing Transactions
    const [recentBorrows] = await db.query(`
      SELECT 
        b.id,
        b.borrowing_code,
        m.member_code,
        m.first_name AS member_name,
        bk.title AS book_title,
        bc.barcode,
        b.borrow_date,
        b.due_date,
        b.status
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN book_copies bc ON b.book_copy_id = bc.id
      JOIN books bk ON bc.book_id = bk.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // 3. Top Popular Books (last 30 days)
    const [popularBooks] = await db.query(`
      SELECT 
        bk.id,
        bk.title,
        bk.author,
        bk.cover_image_url,
        c.name AS category_name,
        COUNT(b.id) AS borrow_count,
        bk.available_copies,
        bk.total_copies
      FROM books bk
      LEFT JOIN book_categories c ON bk.category_id = c.id
      JOIN book_copies bc ON bk.id = bc.book_id
      JOIN borrowings b ON bc.id = b.book_copy_id
      WHERE b.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND bk.deleted_at IS NULL
      GROUP BY bk.id
      ORDER BY borrow_count DESC
      LIMIT 5
    `);

    return successResponse(
      res,
      {
        kpis: {
          total_books: parseInt(kpis.total_books, 10),
          total_copies: parseInt(kpis.total_copies, 10),
          available_copies: parseInt(kpis.available_copies, 10),
          total_members: parseInt(kpis.total_members, 10),
          active_borrows: parseInt(kpis.active_borrows, 10),
          today_borrows: parseInt(kpis.today_borrows, 10),
          today_returns: parseInt(kpis.today_returns, 10),
          overdue_count: parseInt(kpis.overdue_count, 10),
          pending_reservations: parseInt(kpis.pending_reservations, 10),
          available_reservations_holding: parseInt(kpis.available_reservations_holding, 10),
          total_unpaid_fines: parseFloat(kpis.total_unpaid_fines),
          monthly_collected_fines: parseFloat(kpis.monthly_collected_fines),
        },
        recent_activity: {
          recent_borrows: recentBorrows,
          popular_books: popularBooks,
        },
        generated_at: new Date().toISOString(),
      },
      'Staff dashboard summary retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/dashboard/member-summary
 * Aggregates personal metrics for the logged-in member
 */
const getMemberSummary = async (req, res, next) => {
  try {
    const [memberRows] = await db.query(
      `SELECT id, member_code, first_name, last_name, max_borrow_limit, membership_status 
       FROM members WHERE user_id = ?`,
      [req.user.id]
    );

    if (memberRows.length === 0) {
      throw new AppError('Member profile not found.', 404);
    }

    const member = memberRows[0];

    // 1. Personal KPIs
    const [statsRows] = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM borrowings WHERE member_id = ? AND status IN ('borrowed', 'overdue')) AS current_borrows_count,
        (SELECT MIN(due_date) FROM borrowings WHERE member_id = ? AND status = 'borrowed') AS nearest_due_date,
        (SELECT COUNT(*) FROM borrowings WHERE member_id = ? AND (status = 'overdue' OR (status = 'borrowed' AND due_date < CURDATE()))) AS overdue_count,
        (SELECT COUNT(*) FROM reservations WHERE member_id = ? AND status IN ('pending', 'available')) AS active_reservations_count,
        (SELECT COUNT(*) FROM reservations WHERE member_id = ? AND status = 'available') AS ready_for_pickup_reservations,
        (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE member_id = ? AND status = 'unpaid') AS total_unpaid_fines,
        (SELECT COUNT(*) FROM borrowings WHERE member_id = ?) AS total_borrow_history`,
      [member.id, member.id, member.id, member.id, member.id, member.id, member.id]
    );

    const stats = statsRows[0];

    // 2. Current Active Borrowings List
    const [currentBorrows] = await db.query(
      `SELECT 
         b.id,
         b.borrowing_code,
         bk.title AS book_title,
         bk.author AS book_author,
         bk.cover_image_url,
         bc.barcode,
         b.borrow_date,
         b.due_date,
         b.status,
         (CASE WHEN b.due_date < CURDATE() THEN DATEDIFF(CURDATE(), b.due_date) ELSE 0 END) AS days_late
       FROM borrowings b
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       WHERE b.member_id = ? AND b.status IN ('borrowed', 'overdue')
       ORDER BY b.due_date ASC
       LIMIT 5`,
      [member.id]
    );

    // 3. Active Reservations
    const [activeReservations] = await db.query(
      `SELECT 
         r.id,
         r.reservation_code,
         bk.title AS book_title,
         r.queue_number,
         r.status,
         r.hold_until_date
       FROM reservations r
       JOIN books bk ON r.book_id = bk.id
       WHERE r.member_id = ? AND r.status IN ('pending', 'available')
       ORDER BY r.created_at ASC`,
      [member.id]
    );

    return successResponse(
      res,
      {
        member_info: {
          id: member.id,
          member_code: member.member_code,
          full_name: `${member.first_name} ${member.last_name}`,
          membership_status: member.membership_status,
          max_borrow_limit: member.max_borrow_limit,
        },
        kpis: {
          current_borrows_count: parseInt(stats.current_borrows_count, 10),
          remaining_quota: Math.max(0, member.max_borrow_limit - parseInt(stats.current_borrows_count, 10)),
          nearest_due_date: stats.nearest_due_date,
          overdue_count: parseInt(stats.overdue_count, 10),
          active_reservations_count: parseInt(stats.active_reservations_count, 10),
          ready_for_pickup_reservations: parseInt(stats.ready_for_pickup_reservations, 10),
          total_unpaid_fines: parseFloat(stats.total_unpaid_fines),
          total_borrow_history: parseInt(stats.total_borrow_history, 10),
        },
        active_items: {
          current_borrows: currentBorrows,
          active_reservations: activeReservations,
        },
      },
      'Member dashboard summary retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffSummary,
  getMemberSummary,
};
