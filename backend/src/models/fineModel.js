'use strict';

const db = require('../config/db');

/**
 * Fine Model
 * Database operations for fines table
 */

/**
 * Find fines with pagination, filtering and search
 */
const findWithPagination = async ({
  page = 1,
  limit = 10,
  status = null,
  memberId = null,
  search = '',
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('f.status = ?');
    params.push(status);
  }

  if (memberId) {
    conditions.push('f.member_id = ?');
    params.push(memberId);
  }

  if (search && search.trim() !== '') {
    conditions.push('(f.fine_code LIKE ? OR m.member_code LIKE ? OR m.first_name LIKE ? OR m.last_name LIKE ? OR bk.title LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Summary counts and unpaid balance
  const countSql = `
    SELECT 
      COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.amount ELSE 0 END), 0) AS total_unpaid_amount,
      COALESCE(SUM(CASE WHEN f.status = 'paid' THEN f.amount ELSE 0 END), 0) AS total_paid_amount,
      COALESCE(SUM(CASE WHEN f.status = 'waived' THEN f.amount ELSE 0 END), 0) AS total_waived_amount
    FROM fines f
    JOIN members m ON f.member_id = m.id
    JOIN borrowings b ON f.borrowing_id = b.id
    JOIN book_copies bc ON b.book_copy_id = bc.id
    JOIN books bk ON bc.book_id = bk.id
    ${whereClause}
  `;
  const [summaryResult] = await db.query(countSql, params);
  const totalRecords = summaryResult[0].total;

  const dataSql = `
    SELECT 
      f.id,
      f.fine_code,
      f.borrowing_id,
      b.borrowing_code,
      f.member_id,
      m.member_code,
      m.first_name AS member_first_name,
      m.last_name AS member_last_name,
      bk.id AS book_id,
      bk.title AS book_title,
      bc.barcode,
      f.overdue_days,
      f.daily_rate,
      f.amount,
      f.status,
      f.paid_at,
      f.collected_by,
      u_col.username AS collected_by_username,
      f.waived_reason,
      f.created_at,
      f.updated_at
    FROM fines f
    JOIN members m ON f.member_id = m.id
    JOIN borrowings b ON f.borrowing_id = b.id
    JOIN book_copies bc ON b.book_copy_id = bc.id
    JOIN books bk ON bc.book_id = bk.id
    LEFT JOIN users u_col ON f.collected_by = u_col.id
    ${whereClause}
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(dataSql, [...params, limitNum, offset]);

  return {
    fines: rows,
    summary: {
      total_unpaid_amount: parseFloat(summaryResult[0].total_unpaid_amount),
      total_paid_amount: parseFloat(summaryResult[0].total_paid_amount),
      total_waived_amount: parseFloat(summaryResult[0].total_waived_amount),
    },
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * Find fine by ID with member and borrowing details
 */
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
       f.id,
       f.fine_code,
       f.borrowing_id,
       b.borrowing_code,
       b.borrow_date,
       b.due_date,
       b.return_date,
       f.member_id,
       m.user_id AS member_user_id,
       m.member_code,
       m.first_name AS member_first_name,
       m.last_name AS member_last_name,
       bk.id AS book_id,
       bk.title AS book_title,
       bc.barcode,
       f.overdue_days,
       f.daily_rate,
       f.amount,
       f.status,
       f.paid_at,
       f.collected_by,
       u_col.username AS collected_by_username,
       f.waived_reason,
       f.created_at,
       f.updated_at
     FROM fines f
     JOIN members m ON f.member_id = m.id
     JOIN borrowings b ON f.borrowing_id = b.id
     JOIN book_copies bc ON b.book_copy_id = bc.id
     JOIN books bk ON bc.book_id = bk.id
     LEFT JOIN users u_col ON f.collected_by = u_col.id
     WHERE f.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Pay fine
 */
const payFine = async (id, collectedByUserId) => {
  await db.query(
    `UPDATE fines SET 
       status = 'paid',
       paid_at = NOW(),
       collected_by = ?,
       updated_at = NOW()
     WHERE id = ? AND status = 'unpaid'`,
    [collectedByUserId, id]
  );
};

/**
 * Waive fine
 */
const waiveFine = async (id, waivedReason, waivedByUserId) => {
  await db.query(
    `UPDATE fines SET 
       status = 'waived',
       waived_reason = ?,
       collected_by = ?,
       updated_at = NOW()
     WHERE id = ? AND status = 'unpaid'`,
    [waivedReason.trim(), waivedByUserId, id]
  );
};

module.exports = {
  findWithPagination,
  findById,
  payFine,
  waiveFine,
};
