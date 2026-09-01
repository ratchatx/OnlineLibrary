'use strict';

const db = require('../config/db');

/**
 * Category Model
 * Database operations for book_categories table
 */

/**
 * Find all categories (excluding soft-deleted)
 */
const findAll = async (search = '') => {
  let sql = `
    SELECT 
      c.id, 
      c.name, 
      c.description, 
      c.parent_id, 
      p.name AS parent_name,
      c.created_at,
      (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id AND b.deleted_at IS NULL) AS book_count
    FROM book_categories c
    LEFT JOIN book_categories p ON c.parent_id = p.id
    WHERE c.deleted_at IS NULL
  `;
  const params = [];

  if (search && search.trim() !== '') {
    sql += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
    const searchParam = `%${search.trim()}%`;
    params.push(searchParam, searchParam);
  }

  sql += ` ORDER BY c.parent_id ASC, c.name ASC`;

  const [rows] = await db.query(sql, params);
  return rows;
};

/**
 * Find category by ID
 */
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
       c.id, 
       c.name, 
       c.description, 
       c.parent_id, 
       p.name AS parent_name,
       c.created_at,
       (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id AND b.deleted_at IS NULL) AS book_count
     FROM book_categories c
     LEFT JOIN book_categories p ON c.parent_id = p.id
     WHERE c.id = ? AND c.deleted_at IS NULL`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Find category by name (to check duplicates)
 */
const findByName = async (name, excludeId = null) => {
  let sql = `SELECT id, name FROM book_categories WHERE name = ? AND deleted_at IS NULL`;
  const params = [name.trim()];

  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);
  return rows[0] || null;
};

/**
 * Create a new category
 */
const create = async ({ name, description = null, parent_id = null }) => {
  const [result] = await db.query(
    `INSERT INTO book_categories (name, description, parent_id) VALUES (?, ?, ?)`,
    [name.trim(), description ? description.trim() : null, parent_id || null]
  );
  return result.insertId;
};

/**
 * Update an existing category
 */
const update = async (id, { name, description = null, parent_id = null }) => {
  await db.query(
    `UPDATE book_categories 
     SET name = ?, description = ?, parent_id = ? 
     WHERE id = ? AND deleted_at IS NULL`,
    [name.trim(), description ? description.trim() : null, parent_id || null, id]
  );
};

/**
 * Soft delete category
 */
const deleteById = async (id) => {
  await db.query(
    `UPDATE book_categories SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
};

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  deleteById,
};
