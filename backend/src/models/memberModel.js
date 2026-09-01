'use strict';

const db = require('../config/db');

/**
 * Member Model
 * Database operations for members table & aggregated statistics
 */

/**
 * Find all members with pagination, search, and active counts
 */
const findWithPagination = async ({
  page = 1,
  limit = 10,
  search = '',
  status = null,
  sort = 'created_at',
  order = 'desc',
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('m.membership_status = ?');
    params.push(status);
  }

  if (search && search.trim() !== '') {
    conditions.push(
      '(m.member_code LIKE ? OR m.first_name LIKE ? OR m.last_name LIKE ? OR m.phone LIKE ? OR u.email LIKE ? OR u.username LIKE ?)'
    );
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Allowed sorting columns
  const allowedSortCols = {
    member_code: 'm.member_code',
    first_name: 'm.first_name',
    last_name: 'm.last_name',
    status: 'm.membership_status',
    created_at: 'm.created_at',
  };
  const sortCol = allowedSortCols[sort] || 'm.created_at';
  const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  // Count total
  const countSql = `
    SELECT COUNT(*) AS total
    FROM members m
    JOIN users u ON m.user_id = u.id
    ${whereClause}
  `;
  const [countResult] = await db.query(countSql, params);
  const totalRecords = countResult[0].total;

  // Fetch paginated data with summary aggregates
  const dataSql = `
    SELECT 
      m.id,
      m.user_id,
      u.username,
      u.email,
      u.status AS user_status,
      m.member_code,
      m.first_name,
      m.last_name,
      m.phone,
      m.address,
      m.membership_status,
      m.max_borrow_limit,
      m.created_at,
      m.updated_at,
      (SELECT COUNT(*) FROM borrowings b WHERE b.member_id = m.id AND b.status IN ('borrowed', 'overdue')) AS active_borrow_count,
      (SELECT COUNT(*) FROM borrowings b WHERE b.member_id = m.id AND (b.status = 'overdue' OR (b.status = 'borrowed' AND b.due_date < CURDATE()))) AS overdue_count,
      (SELECT COUNT(*) FROM reservations r WHERE r.member_id = m.id AND r.status IN ('pending', 'available')) AS active_reservation_count,
      (SELECT COALESCE(SUM(f.amount), 0) FROM fines f WHERE f.member_id = m.id AND f.status = 'unpaid') AS unpaid_fine_balance
    FROM members m
    JOIN users u ON m.user_id = u.id
    ${whereClause}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(dataSql, [...params, limitNum, offset]);

  return {
    members: rows,
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * Find single member by ID with full statistics
 */
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
       m.id,
       m.user_id,
       u.username,
       u.email,
       u.status AS user_status,
       m.member_code,
       m.first_name,
       m.last_name,
       m.phone,
       m.address,
       m.membership_status,
       m.max_borrow_limit,
       m.created_at,
       m.updated_at,
       (SELECT COUNT(*) FROM borrowings b WHERE b.member_id = m.id AND b.status IN ('borrowed', 'overdue')) AS active_borrow_count,
       (SELECT COUNT(*) FROM borrowings b WHERE b.member_id = m.id AND (b.status = 'overdue' OR (b.status = 'borrowed' AND b.due_date < CURDATE()))) AS overdue_count,
       (SELECT COUNT(*) FROM borrowings b WHERE b.member_id = m.id) AS total_borrow_count,
       (SELECT COUNT(*) FROM reservations r WHERE r.member_id = m.id AND r.status IN ('pending', 'available')) AS active_reservation_count,
       (SELECT COALESCE(SUM(f.amount), 0) FROM fines f WHERE f.member_id = m.id AND f.status = 'unpaid') AS unpaid_fine_balance
     FROM members m
     JOIN users u ON m.user_id = u.id
     WHERE m.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Find member by user_id
 */
const findByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT m.*, u.username, u.email 
     FROM members m 
     JOIN users u ON m.user_id = u.id 
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

/**
 * Update member profile
 */
const update = async (id, {
  first_name,
  last_name,
  phone = null,
  address = null,
  membership_status = null,
  max_borrow_limit = null,
}) => {
  const fields = [];
  const params = [];

  if (first_name !== undefined) {
    fields.push('first_name = ?');
    params.push(first_name.trim());
  }

  if (last_name !== undefined) {
    fields.push('last_name = ?');
    params.push(last_name.trim());
  }

  if (phone !== undefined) {
    fields.push('phone = ?');
    params.push(phone ? phone.trim() : null);
  }

  if (address !== undefined) {
    fields.push('address = ?');
    params.push(address ? address.trim() : null);
  }

  if (membership_status !== undefined && membership_status !== null) {
    fields.push('membership_status = ?');
    params.push(membership_status);
  }

  if (max_borrow_limit !== undefined && max_borrow_limit !== null) {
    fields.push('max_borrow_limit = ?');
    params.push(parseInt(max_borrow_limit, 10));
  }

  if (fields.length === 0) return;

  fields.push('updated_at = NOW()');
  params.push(id);

  const sql = `UPDATE members SET ${fields.join(', ')} WHERE id = ?`;
  await db.query(sql, params);
};

/**
 * Find member's borrowings with pagination
 */
const findMemberBorrowings = async (memberId, {
  page = 1,
  limit = 10,
  status = null,
  overdueOnly = false,
  search = '',
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = ['b.member_id = ?'];
  const params = [memberId];

  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }

  if (overdueOnly === true || overdueOnly === 'true' || overdueOnly === '1') {
    conditions.push("(b.status = 'overdue' OR (b.status = 'borrowed' AND b.due_date < CURDATE()))");
  }

  if (search && search.trim() !== '') {
    conditions.push('(b.borrowing_code LIKE ? OR bk.title LIKE ? OR bc.barcode LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Total
  const [countResult] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM borrowings b
     JOIN book_copies bc ON b.book_copy_id = bc.id
     JOIN books bk ON bc.book_id = bk.id
     ${whereClause}`,
    params
  );
  const totalRecords = countResult[0].total;

  // Records
  const [rows] = await db.query(
    `SELECT 
       b.id,
       b.borrowing_code,
       b.book_copy_id,
       bc.barcode,
       bk.id AS book_id,
       bk.title AS book_title,
       bk.cover_image_url AS book_cover_image,
       b.borrow_date,
       b.due_date,
       b.return_date,
       b.status,
       b.notes,
       b.created_at,
       (CASE WHEN b.status IN ('borrowed', 'overdue') AND b.due_date < CURDATE() 
             THEN DATEDIFF(CURDATE(), b.due_date) ELSE 0 END) AS current_overdue_days,
       f.id AS fine_id,
       f.amount AS fine_amount,
       f.status AS fine_status
     FROM borrowings b
     JOIN book_copies bc ON b.book_copy_id = bc.id
     JOIN books bk ON bc.book_id = bk.id
     LEFT JOIN fines f ON b.id = f.borrowing_id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return {
    borrowings: rows,
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * Find member's reservations with pagination
 */
const findMemberReservations = async (memberId, {
  page = 1,
  limit = 10,
  status = null,
  search = '',
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = ['r.member_id = ?'];
  const params = [memberId];

  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }

  if (search && search.trim() !== '') {
    conditions.push('(r.reservation_code LIKE ? OR b.title LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [countResult] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM reservations r
     JOIN books b ON r.book_id = b.id
     ${whereClause}`,
    params
  );
  const totalRecords = countResult[0].total;

  const [rows] = await db.query(
    `SELECT 
       r.id,
       r.reservation_code,
       r.book_id,
       b.title AS book_title,
       b.cover_image_url AS book_cover_image,
       r.queue_number,
       r.reservation_date,
       r.status,
       r.hold_until_date,
       r.allocated_copy_id,
       bc.barcode AS allocated_barcode,
       r.created_at
     FROM reservations r
     JOIN books b ON r.book_id = b.id
     LEFT JOIN book_copies bc ON r.allocated_copy_id = bc.id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return {
    reservations: rows,
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * Find member's fines with pagination and total unpaid summary
 */
const findMemberFines = async (memberId, {
  page = 1,
  limit = 10,
  status = null,
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = ['f.member_id = ?'];
  const params = [memberId];

  if (status) {
    conditions.push('f.status = ?');
    params.push(status);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Total records & total unpaid sum
  const [summaryResult] = await db.query(
    `SELECT 
       COUNT(*) AS total,
       COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.amount ELSE 0 END), 0) AS total_unpaid_amount
     FROM fines f
     ${whereClause}`,
    params
  );
  const totalRecords = summaryResult[0].total;
  const totalUnpaidAmount = parseFloat(summaryResult[0].total_unpaid_amount);

  const [rows] = await db.query(
    `SELECT 
       f.id,
       f.fine_code,
       f.borrowing_id,
       b.borrowing_code,
       bk.title AS book_title,
       f.overdue_days,
       f.daily_rate,
       f.amount,
       f.status,
       f.paid_at,
       f.collected_by,
       f.waived_reason,
       f.created_at,
       f.updated_at
     FROM fines f
     JOIN borrowings b ON f.borrowing_id = b.id
     JOIN book_copies bc ON b.book_copy_id = bc.id
     JOIN books bk ON bc.book_id = bk.id
     ${whereClause}
     ORDER BY f.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return {
    fines: rows,
    summary: {
      total_unpaid_amount: totalUnpaidAmount,
    },
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

module.exports = {
  findWithPagination,
  findById,
  findByUserId,
  update,
  findMemberBorrowings,
  findMemberReservations,
  findMemberFines,
};
