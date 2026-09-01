'use strict';

const db = require('../config/db');

/**
 * Notification Model
 * Database operations for notifications table
 */

/**
 * Find notifications for a specific user with pagination and unread summary
 */
const findByUserId = async (userId, { is_read = null, page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = ['user_id = ?'];
  const params = [userId];

  if (is_read !== null && is_read !== undefined) {
    const isReadVal = is_read === true || is_read === 'true' || is_read === '1' ? 1 : 0;
    conditions.push('is_read = ?');
    params.push(isReadVal);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Total matching records
  const [countResult] = await db.query(
    `SELECT COUNT(*) AS total FROM notifications ${whereClause}`,
    params
  );
  const totalRecords = countResult[0].total;

  // Unread total
  const [unreadResult] = await db.query(
    `SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
  const unreadCount = unreadResult[0].unread_count;

  // Paginated notifications
  const [rows] = await db.query(
    `SELECT 
       id,
       user_id,
       type,
       title,
       message,
       is_read,
       read_at,
       related_entity_type,
       related_entity_id,
       created_at
     FROM notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return {
    notifications: rows,
    unread_count: unreadCount,
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * Find notification by ID
 */
const findById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM notifications WHERE id = ?`, [id]);
  return rows[0] || null;
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (id, userId) => {
  const [result] = await db.query(
    `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ? AND is_read = 0`,
    [id, userId]
  );
  return result.affectedRows > 0;
};

/**
 * Mark all notifications for a user as read
 */
const markAllAsRead = async (userId) => {
  const [result] = await db.query(
    `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
  return result.affectedRows;
};

/**
 * Create a new notification
 */
const create = async ({
  user_id,
  type,
  title,
  message,
  related_entity_type = null,
  related_entity_id = null,
}) => {
  const [result] = await db.query(
    `INSERT INTO notifications (
       user_id, type, title, message, related_entity_type, related_entity_id
     ) VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, type, title, message, related_entity_type, related_entity_id]
  );
  return result.insertId;
};

/**
 * Check if a duplicate notification was already sent today
 */
const existsDuplicateToday = async (userId, type, relatedEntityType, relatedEntityId) => {
  const [rows] = await db.query(
    `SELECT id FROM notifications 
     WHERE user_id = ? 
       AND type = ? 
       AND related_entity_type = ? 
       AND related_entity_id = ? 
       AND DATE(created_at) = CURDATE()`,
    [userId, type, relatedEntityType, relatedEntityId]
  );
  return rows.length > 0;
};

module.exports = {
  findByUserId,
  findById,
  markAsRead,
  markAllAsRead,
  create,
  existsDuplicateToday,
};
