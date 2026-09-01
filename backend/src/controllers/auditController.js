'use strict';

const db = require('../config/db');
const { paginatedResponse } = require('../utils/response');

/**
 * Audit Log Controller
 * Reference: docs/planning/06-api-contract.md (Section 22)
 */

/**
 * GET /api/v1/audit-logs
 * List system audit logs (Admin only)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      user_id,
      action,
      entity_name,
      date_from,
      date_to,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (user_id) {
      conditions.push('a.user_id = ?');
      params.push(parseInt(user_id, 10));
    }

    if (action) {
      conditions.push('a.action = ?');
      params.push(action.trim());
    }

    if (entity_name) {
      conditions.push('a.entity_name = ?');
      params.push(entity_name.trim());
    }

    if (date_from) {
      conditions.push('a.created_at >= ?');
      params.push(date_from);
    }

    if (date_to) {
      conditions.push('a.created_at <= ?');
      params.push(date_to);
    }

    if (search && search.trim() !== '') {
      conditions.push('(a.action LIKE ? OR a.entity_name LIKE ? OR u.username LIKE ? OR a.ip_address LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total Count
    const countSql = `
      SELECT COUNT(*) AS total 
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
    `;
    const [countResult] = await db.query(countSql, params);
    const totalRecords = countResult[0].total;

    // Fetch Logs
    const dataSql = `
      SELECT 
        a.id,
        a.user_id,
        u.username,
        r.name AS user_role,
        a.action,
        a.entity_name,
        a.entity_id,
        a.old_values,
        a.new_values,
        a.ip_address,
        a.user_agent,
        a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limitNum, offset]);

    return paginatedResponse(
      res,
      rows,
      {
        totalRecords,
        currentPage: pageNum,
        limit: limitNum,
      },
      'Audit logs retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
