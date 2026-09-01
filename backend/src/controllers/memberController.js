'use strict';

const memberModel = require('../models/memberModel');
const { successResponse, paginatedResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Member Controller
 * Reference: docs/planning/06-api-contract.md (Section 10)
 */

/**
 * IDOR Verification Helper
 * Ensures members can only access and modify their own data
 */
const assertMemberAccess = (reqUser, targetMember) => {
  if (['admin', 'librarian'].includes(reqUser.role)) {
    return true; // Staff have full access
  }

  if (reqUser.role === 'member') {
    if (targetMember.user_id !== reqUser.id) {
      throw new AppError('Forbidden: You do not have permission to access this member profile.', 403);
    }
    return true;
  }

  throw new AppError('Forbidden: Unauthorized role.', 403);
};

/**
 * GET /api/v1/members
 * List all members with filtering, search, sorting and pagination (Librarian, Admin)
 */
const getMembers = async (req, res, next) => {
  try {
    const { page, limit, search, status, sort, order } = req.query;

    const result = await memberModel.findWithPagination({
      page,
      limit,
      search,
      status,
      sort,
      order,
    });

    return paginatedResponse(
      res,
      result.members,
      result.pagination,
      'Members retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/members/:id
 * Retrieve single member profile with activity summary and IDOR protection
 */
const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await memberModel.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    assertMemberAccess(req.user, member);

    return successResponse(res, member, 'Member profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/members/:id
 * Update member profile with IDOR protection
 */
const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      address,
      membership_status,
      max_borrow_limit,
    } = req.body;

    const member = await memberModel.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    assertMemberAccess(req.user, member);

    // Validation
    if (first_name !== undefined && first_name.trim() === '') {
      throw new AppError('First name cannot be empty.', 400);
    }
    if (last_name !== undefined && last_name.trim() === '') {
      throw new AppError('Last name cannot be empty.', 400);
    }

    // Only staff can modify membership_status or max_borrow_limit
    const isStaff = ['admin', 'librarian'].includes(req.user.role);
    const updatePayload = {
      first_name,
      last_name,
      phone,
      address,
      membership_status: isStaff ? membership_status : undefined,
      max_borrow_limit: isStaff ? max_borrow_limit : undefined,
    };

    await memberModel.update(id, updatePayload);

    const updated = await memberModel.findById(id);

    return successResponse(res, updated, 'Member profile updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/members/:id/borrowings
 * Retrieve member's borrowing history with IDOR protection
 */
const getMemberBorrowings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, status, overdue_only, search } = req.query;

    const member = await memberModel.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    assertMemberAccess(req.user, member);

    const result = await memberModel.findMemberBorrowings(id, {
      page,
      limit,
      status,
      overdueOnly: overdue_only,
      search,
    });

    return paginatedResponse(
      res,
      result.borrowings,
      result.pagination,
      'Member borrowing history retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/members/:id/reservations
 * Retrieve member's reservation history with IDOR protection
 */
const getMemberReservations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, status, search } = req.query;

    const member = await memberModel.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    assertMemberAccess(req.user, member);

    const result = await memberModel.findMemberReservations(id, {
      page,
      limit,
      status,
      search,
    });

    return paginatedResponse(
      res,
      result.reservations,
      result.pagination,
      'Member reservations retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/members/:id/fines
 * Retrieve member's fines and total unpaid balance with IDOR protection
 */
const getMemberFines = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, status } = req.query;

    const member = await memberModel.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    assertMemberAccess(req.user, member);

    const result = await memberModel.findMemberFines(id, {
      page,
      limit,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Member fines retrieved successfully',
      data: result.fines,
      summary: result.summary,
      pagination: {
        total_records: result.pagination.totalRecords,
        current_page: result.pagination.currentPage,
        total_pages: Math.ceil(result.pagination.totalRecords / result.pagination.limit),
        limit: result.pagination.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  updateMember,
  getMemberBorrowings,
  getMemberReservations,
  getMemberFines,
};
