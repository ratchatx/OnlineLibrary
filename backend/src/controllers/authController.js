'use strict';

const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');
const { successResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Auth Controller
 * Reference: docs/planning/06-api-contract.md (Section 8)
 */

/**
 * POST /api/v1/auth/login
 * Authenticates user credentials and returns JWT token
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Username (or Email) and Password are required.', 400, [
        !username && { field: 'username', message: 'Username is required' },
        !password && { field: 'password', message: 'Password is required' },
      ].filter(Boolean));
    }

    // 1. Find user by username or email
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.password_hash, u.role_id, r.name AS role, u.status 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE (u.username = ? OR u.email = ?) AND u.deleted_at IS NULL`,
      [username.trim(), username.trim().toLowerCase()]
    );

    if (users.length === 0) {
      throw new AppError('Invalid username or password.', 401);
    }

    const user = users[0];

    // 2. Check account status
    if (user.status !== 'active') {
      throw new AppError(`Account is currently ${user.status}. Please contact the library administrator.`, 403);
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid username or password.', 401);
    }

    // 4. Generate JWT Token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    // 5. Fetch associated member profile if exists
    const [members] = await db.query(
      `SELECT id, member_code, first_name, last_name, phone, address, max_borrow_limit, membership_status 
       FROM members 
       WHERE user_id = ?`,
      [user.id]
    );

    const memberProfile = members.length > 0 ? members[0] : null;

    // 6. Return response (ensure password_hash is omitted)
    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          member_profile: memberProfile,
        },
      },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Retrieves current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user data with role
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name AS role, u.status, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User profile not found.', 404);
    }

    const user = users[0];

    // 2. Fetch associated member profile if exists
    const [members] = await db.query(
      `SELECT id, member_code, first_name, last_name, phone, address, max_borrow_limit, membership_status, created_at 
       FROM members 
       WHERE user_id = ?`,
      [userId]
    );

    const memberProfile = members.length > 0 ? members[0] : null;

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          member_profile: memberProfile,
        },
      },
      'User profile retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/auth/change-password
 * Changes password for the currently logged-in user
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      throw new AppError('Both current password and new password are required.', 400, [
        !old_password && { field: 'old_password', message: 'Current password is required' },
        !new_password && { field: 'new_password', message: 'New password is required' },
      ].filter(Boolean));
    }

    if (new_password.length < 6) {
      throw new AppError('New password must be at least 6 characters long.', 400, [
        { field: 'new_password', message: 'Password must contain at least 6 characters' },
      ]);
    }

    // 1. Fetch current password hash
    const [users] = await db.query(
      `SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found.', 404);
    }

    const user = users[0];

    // 2. Verify old password
    const isOldPasswordValid = await bcrypt.compare(old_password, user.password_hash);
    if (!isOldPasswordValid) {
      throw new AppError('Current password is incorrect.', 400, [
        { field: 'old_password', message: 'Current password does not match' },
      ]);
    }

    // 3. Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 12);

    // 4. Update database
    await db.query(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [newPasswordHash, userId]
    );

    return successResponse(res, null, 'Password updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Client-side token invalidation confirmation
 */
const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  logout,
};
