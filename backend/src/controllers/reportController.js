'use strict';

const db = require('../config/db');
const { successResponse } = require('../utils/response');

/**
 * Report Controller
 * Reference: docs/planning/06-api-contract.md (Section 21)
 */

/**
 * GET /api/v1/reports/borrow-return
 * Circulation reports grouped by time period and category
 */
const getBorrowReturnReport = async (req, res, next) => {
  try {
    const { date_from, date_to, category_id } = req.query;

    const conditions = [];
    const params = [];

    if (date_from) {
      conditions.push('b.borrow_date >= ?');
      params.push(date_from);
    }
    if (date_to) {
      conditions.push('b.borrow_date <= ?');
      params.push(date_to);
    }
    if (category_id) {
      conditions.push('bk.category_id = ?');
      params.push(parseInt(category_id, 10));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Overall Summary
    const [summaryResult] = await db.query(
      `SELECT
         COUNT(*) AS total_borrows,
         SUM(CASE WHEN b.status = 'returned' THEN 1 ELSE 0 END) AS total_returned,
         SUM(CASE WHEN b.status = 'borrowed' THEN 1 ELSE 0 END) AS currently_borrowed,
         SUM(CASE WHEN b.status = 'overdue' OR (b.status = 'borrowed' AND b.due_date < CURDATE()) THEN 1 ELSE 0 END) AS total_overdue
       FROM borrowings b
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       ${whereClause}`,
      params
    );

    // 2. Timeline Aggregation (Grouped by Date)
    const [timelineResult] = await db.query(
      `SELECT
         DATE(b.borrow_date) AS date,
         COUNT(b.id) AS borrow_count,
         SUM(CASE WHEN b.status = 'returned' THEN 1 ELSE 0 END) AS return_count
       FROM borrowings b
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       ${whereClause}
       GROUP BY DATE(b.borrow_date)
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    // 3. Category Breakdown
    const [categoryResult] = await db.query(
      `SELECT
         COALESCE(c.name, 'Uncategorized') AS category_name,
         COUNT(b.id) AS borrow_count
       FROM borrowings b
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       LEFT JOIN book_categories c ON bk.category_id = c.id
       ${whereClause}
       GROUP BY c.id, c.name
       ORDER BY borrow_count DESC`,
      params
    );

    return successResponse(
      res,
      {
        filters: { date_from: date_from || null, date_to: date_to || null, category_id: category_id || null },
        summary: summaryResult[0],
        timeline: timelineResult,
        category_breakdown: categoryResult,
      },
      'Borrow-Return report generated successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/overdue-fines
 * Overdue loans, fines collection and waiving financial report
 */
const getOverdueFinesReport = async (req, res, next) => {
  try {
    const { date_from, date_to, status } = req.query;

    const conditions = [];
    const params = [];

    if (date_from) {
      conditions.push('f.created_at >= ?');
      params.push(date_from);
    }
    if (date_to) {
      conditions.push('f.created_at <= ?');
      params.push(date_to);
    }
    if (status) {
      conditions.push('f.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Financial Summary
    const [summaryResult] = await db.query(
      `SELECT
         COUNT(*) AS total_fines_count,
         COALESCE(SUM(f.amount), 0) AS total_fines_amount,
         COALESCE(SUM(CASE WHEN f.status = 'paid' THEN f.amount ELSE 0 END), 0) AS paid_amount,
         COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.amount ELSE 0 END), 0) AS unpaid_amount,
         COALESCE(SUM(CASE WHEN f.status = 'waived' THEN f.amount ELSE 0 END), 0) AS waived_amount,
         COUNT(CASE WHEN f.status = 'paid' THEN 1 END) AS paid_count,
         COUNT(CASE WHEN f.status = 'unpaid' THEN 1 END) AS unpaid_count,
         COUNT(CASE WHEN f.status = 'waived' THEN 1 END) AS waived_count
       FROM fines f
       ${whereClause}`,
      params
    );

    const summary = summaryResult[0];
    const totalAmount = parseFloat(summary.total_fines_amount) || 0;
    const paidAmount = parseFloat(summary.paid_amount) || 0;
    const collectionRate = totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : '100.00';

    // 2. Detailed Fine Records
    const [finesList] = await db.query(
      `SELECT
         f.id,
         f.fine_code,
         b.borrowing_code,
         m.member_code,
         m.first_name AS member_name,
         bk.title AS book_title,
         f.overdue_days,
         f.amount,
         f.status,
         f.paid_at,
         f.waived_reason,
         f.created_at
       FROM fines f
       JOIN borrowings b ON f.borrowing_id = b.id
       JOIN members m ON f.member_id = m.id
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT 50`,
      params
    );

    return successResponse(
      res,
      {
        filters: { date_from: date_from || null, date_to: date_to || null, status: status || null },
        financial_summary: {
          ...summary,
          collection_rate_percentage: parseFloat(collectionRate),
        },
        records: finesList,
      },
      'Overdue & fines report generated successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reports/popular-books
 * Top borrowed books ranking report
 */
const getPopularBooksReport = async (req, res, next) => {
  try {
    const { limit = 10, period = 'all', category_id } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const conditions = ['bk.deleted_at IS NULL'];
    const params = [];

    if (period === '7days') {
      conditions.push('b.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
    } else if (period === '30days') {
      conditions.push('b.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
    } else if (period === 'year') {
      conditions.push('b.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)');
    }

    if (category_id) {
      conditions.push('bk.category_id = ?');
      params.push(parseInt(category_id, 10));
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await db.query(
      `SELECT
         bk.id,
         bk.isbn,
         bk.title,
         bk.author,
         bk.publisher,
         c.name AS category_name,
         bk.total_copies,
         bk.available_copies,
         COUNT(b.id) AS total_borrows,
         COUNT(DISTINCT b.member_id) AS unique_borrowers
       FROM books bk
       LEFT JOIN book_categories c ON bk.category_id = c.id
       JOIN book_copies bc ON bk.id = bc.book_id
       JOIN borrowings b ON bc.id = b.book_copy_id
       ${whereClause}
       GROUP BY bk.id
       ORDER BY total_borrows DESC, bk.title ASC
       LIMIT ?`,
      [...params, limitNum]
    );

    return successResponse(
      res,
      {
        period,
        category_id: category_id || null,
        top_books: rows,
      },
      'Popular books report generated successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBorrowReturnReport,
  getOverdueFinesReport,
  getPopularBooksReport,
};
