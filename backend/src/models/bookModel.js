'use strict';

const db = require('../config/db');

/**
 * Book Model
 * Database operations for books table
 */

/**
 * Query books with full search, filtering, sorting and pagination
 */
const findWithPagination = async ({
  search = '',
  category_id = null,
  availability = null,
  author = '',
  publisher = '',
  sort = 'created_at',
  order = 'desc',
  page = 1,
  limit = 10,
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  // Build WHERE conditions
  const conditions = ['b.deleted_at IS NULL'];
  const params = [];

  if (search && search.trim() !== '') {
    conditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.publisher LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  if (category_id) {
    conditions.push('(b.category_id = ? OR c.parent_id = ?)');
    params.push(parseInt(category_id, 10), parseInt(category_id, 10));
  }

  if (author && author.trim() !== '') {
    conditions.push('b.author LIKE ?');
    params.push(`%${author.trim()}%`);
  }

  if (publisher && publisher.trim() !== '') {
    conditions.push('b.publisher LIKE ?');
    params.push(`%${publisher.trim()}%`);
  }

  if (availability === 'available' || availability === 'true' || availability === '1') {
    conditions.push('b.available_copies > 0');
  } else if (availability === 'unavailable' || availability === 'false' || availability === '0') {
    conditions.push('b.available_copies = 0');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Safe sorting columns
  const allowedSortCols = {
    title: 'b.title',
    author: 'b.author',
    publish_year: 'b.publish_year',
    available_copies: 'b.available_copies',
    total_copies: 'b.total_copies',
    created_at: 'b.created_at',
    category: 'c.name',
  };
  const sortCol = allowedSortCols[sort] || 'b.created_at';
  const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  // 1. Total records count
  const countSql = `
    SELECT COUNT(*) AS total 
    FROM books b 
    LEFT JOIN book_categories c ON b.category_id = c.id 
    ${whereClause}
  `;
  const [countResult] = await db.query(countSql, params);
  const totalRecords = countResult[0].total;

  // 2. Fetch paginated records
  const dataSql = `
    SELECT 
      b.id,
      b.isbn,
      b.title,
      b.author,
      b.publisher,
      b.publish_year,
      b.category_id,
      c.name AS category_name,
      b.description,
      b.cover_image_url,
      b.total_copies,
      b.available_copies,
      b.created_at,
      b.updated_at
    FROM books b
    LEFT JOIN book_categories c ON b.category_id = c.id
    ${whereClause}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(dataSql, [...params, limitNum, offset]);

  return {
    books: rows,
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * Find single book by ID with detailed info and copies summary
 */
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
       b.id,
       b.isbn,
       b.title,
       b.author,
       b.publisher,
       b.publish_year,
       b.category_id,
       c.name AS category_name,
       b.description,
       b.cover_image_url,
       b.total_copies,
       b.available_copies,
       b.created_at,
       b.updated_at
     FROM books b
     LEFT JOIN book_categories c ON b.category_id = c.id
     WHERE b.id = ? AND b.deleted_at IS NULL`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Find book by ISBN (to verify uniqueness)
 */
const findByIsbn = async (isbn, excludeId = null) => {
  let sql = `SELECT id, isbn, title FROM books WHERE isbn = ? AND deleted_at IS NULL`;
  const params = [isbn.trim()];

  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);
  return rows[0] || null;
};

/**
 * Create a new book
 */
const create = async ({
  isbn,
  title,
  author,
  publisher = null,
  publish_year = null,
  category_id,
  description = null,
  cover_image_url = null,
}) => {
  const [result] = await db.query(
    `INSERT INTO books (
       isbn, title, author, publisher, publish_year, 
       category_id, description, cover_image_url, 
       total_copies, available_copies
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      isbn.trim(),
      title.trim(),
      author.trim(),
      publisher ? publisher.trim() : null,
      publish_year ? parseInt(publish_year, 10) : null,
      parseInt(category_id, 10),
      description ? description.trim() : null,
      cover_image_url ? cover_image_url.trim() : null,
    ]
  );
  return result.insertId;
};

/**
 * Update an existing book
 */
const update = async (id, {
  title,
  author,
  publisher = null,
  publish_year = null,
  category_id,
  description = null,
  cover_image_url = null,
}) => {
  await db.query(
    `UPDATE books SET 
       title = ?,
       author = ?,
       publisher = ?,
       publish_year = ?,
       category_id = ?,
       description = ?,
       cover_image_url = ?,
       updated_at = NOW()
     WHERE id = ? AND deleted_at IS NULL`,
    [
      title.trim(),
      author.trim(),
      publisher ? publisher.trim() : null,
      publish_year ? parseInt(publish_year, 10) : null,
      parseInt(category_id, 10),
      description ? description.trim() : null,
      cover_image_url ? cover_image_url.trim() : null,
      id,
    ]
  );
};

/**
 * Soft delete a book
 */
const deleteById = async (id) => {
  await db.query(
    `UPDATE books SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
};

/**
 * Recalculate and synchronize total_copies and available_copies from physical copies
 */
const recalculateCopies = async (bookId) => {
  const [stats] = await db.query(
    `SELECT 
       COUNT(*) AS total_copies,
       SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_copies
     FROM book_copies
     WHERE book_id = ?`,
    [bookId]
  );

  const total = stats[0].total_copies || 0;
  const available = stats[0].available_copies || 0;

  await db.query(
    `UPDATE books SET total_copies = ?, available_copies = ?, updated_at = NOW() WHERE id = ?`,
    [total, available, bookId]
  );

  return { total_copies: total, available_copies: available };
};

module.exports = {
  findWithPagination,
  findById,
  findByIsbn,
  create,
  update,
  deleteById,
  recalculateCopies,
};
