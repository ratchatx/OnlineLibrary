'use strict';

const db = require('../config/db');

/**
 * Book Copy Model
 * Database operations for book_copies table (physical copies)
 */

/**
 * Find all copies for a given book
 */
const findByBookId = async (bookId) => {
  const [rows] = await db.query(
    `SELECT 
       bc.id,
       bc.book_id,
       bc.barcode,
       bc.copy_number,
       bc.status,
       bc.created_at,
       bc.updated_at
     FROM book_copies bc
     WHERE bc.book_id = ?
     ORDER BY bc.copy_number ASC`,
    [bookId]
  );
  return rows;
};

/**
 * Find copy by primary ID with book details
 */
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
       bc.id,
       bc.book_id,
       b.title AS book_title,
       b.author AS book_author,
       b.isbn AS book_isbn,
       bc.barcode,
       bc.copy_number,
       bc.status,
       bc.created_at,
       bc.updated_at
     FROM book_copies bc
     JOIN books b ON bc.book_id = b.id
     WHERE bc.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Find copy by barcode
 */
const findByBarcode = async (barcode, excludeId = null) => {
  let sql = `
    SELECT 
      bc.id,
      bc.book_id,
      b.title AS book_title,
      b.author AS book_author,
      b.isbn AS book_isbn,
      b.cover_image_url AS book_cover_image,
      bc.barcode,
      bc.copy_number,
      bc.status,
      bc.created_at,
      bc.updated_at
    FROM book_copies bc
    JOIN books b ON bc.book_id = b.id
    WHERE bc.barcode = ?
  `;
  const params = [barcode.trim()];

  if (excludeId) {
    sql += ` AND bc.id != ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);
  return rows[0] || null;
};

/**
 * Get the next available copy_number for a book
 */
const getNextCopyNumber = async (bookId) => {
  const [rows] = await db.query(
    `SELECT COALESCE(MAX(copy_number), 0) + 1 AS next_num FROM book_copies WHERE book_id = ?`,
    [bookId]
  );
  return rows[0].next_num;
};

/**
 * Create a new physical copy
 */
const create = async ({ book_id, barcode, copy_number, status = 'available' }) => {
  const [result] = await db.query(
    `INSERT INTO book_copies (book_id, barcode, copy_number, status) VALUES (?, ?, ?, ?)`,
    [book_id, barcode.trim(), copy_number, status]
  );
  return result.insertId;
};

/**
 * Update status of a physical copy (available, maintenance, lost, borrowed, reserved_hold)
 */
const updateStatus = async (id, status) => {
  await db.query(
    `UPDATE book_copies SET status = ?, updated_at = NOW() WHERE id = ?`,
    [status, id]
  );
};

/**
 * Delete a physical copy
 */
const deleteById = async (id) => {
  const [result] = await db.query(`DELETE FROM book_copies WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

/**
 * Check if a copy has borrowing history
 */
const hasBorrowingHistory = async (copyId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM borrowings WHERE book_copy_id = ?`,
    [copyId]
  );
  return rows[0].cnt > 0;
};

module.exports = {
  findByBookId,
  findById,
  findByBarcode,
  getNextCopyNumber,
  create,
  updateStatus,
  deleteById,
  hasBorrowingHistory,
};
