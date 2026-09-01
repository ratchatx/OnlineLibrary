'use strict';

const db = require('../config/db');
const { verifyToken } = require('../config/jwt');
const { AppError } = require('./errorHandler');

/**
 * Authentication Guard Middleware
 * Verifies JWT token and attaches authenticated user data to `req.user`
 */
const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Authentication token missing.', 401);
    }

    // 1. Verify token signature and expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Authentication token expired. Please login again.', 401);
      }
      throw new AppError('Invalid authentication token.', 401);
    }

    // 2. Check if user still exists in database and is active
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name AS role, u.status 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [decoded.id]
    );

    if (rows.length === 0) {
      throw new AppError('User account not found or has been deactivated.', 401);
    }

    const user = rows[0];

    if (user.status !== 'active') {
      throw new AppError(`Account is currently ${user.status}. Access denied.`, 403);
    }

    // 3. Attach authenticated user to request context
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authGuard;
