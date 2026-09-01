'use strict';

const db = require('../config/db');
const { successResponse } = require('../utils/response');

/**
 * Metadata Controller
 * Reference: docs/planning/06-api-contract.md (Section 13)
 */

/**
 * GET /api/v1/metadata/authors
 * Retrieves distinct list of authors in the catalog (Public)
 */
const getAuthors = async (req, res, next) => {
  try {
    const { search, limit = 50 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    let sql = `
      SELECT author, COUNT(*) AS book_count
      FROM books
      WHERE deleted_at IS NULL
    `;
    const params = [];

    if (search && search.trim() !== '') {
      sql += ` AND author LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` GROUP BY author ORDER BY book_count DESC, author ASC LIMIT ?`;
    params.push(limitNum);

    const [rows] = await db.query(sql, params);

    return successResponse(res, rows, 'Authors retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/metadata/publishers
 * Retrieves distinct list of publishers in the catalog (Public)
 */
const getPublishers = async (req, res, next) => {
  try {
    const { search, limit = 50 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    let sql = `
      SELECT publisher, COUNT(*) AS book_count
      FROM books
      WHERE publisher IS NOT NULL AND publisher != '' AND deleted_at IS NULL
    `;
    const params = [];

    if (search && search.trim() !== '') {
      sql += ` AND publisher LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` GROUP BY publisher ORDER BY book_count DESC, publisher ASC LIMIT ?`;
    params.push(limitNum);

    const [rows] = await db.query(sql, params);

    return successResponse(res, rows, 'Publishers retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuthors,
  getPublishers,
};
