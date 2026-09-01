'use strict';

const fineModel = require('../models/fineModel');
const notificationModel = require('../models/notificationModel');
const db = require('../config/db');
const { successResponse, paginatedResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Fine Controller
 * Reference: docs/planning/06-api-contract.md (Section 18)
 */

// Helper to get member_id for user
const getMemberIdForUser = async (userId) => {
  const [rows] = await db.query(`SELECT id FROM members WHERE user_id = ?`, [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

/**
 * GET /api/v1/fines
 * List all fines in system (Librarian, Admin)
 */
const getFines = async (req, res, next) => {
  try {
    const { page, limit, status, member_id, search } = req.query;

    const result = await fineModel.findWithPagination({
      page,
      limit,
      status,
      memberId: member_id,
      search,
    });

    return res.status(200).json({
      success: true,
      message: 'Fines retrieved successfully',
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

/**
 * GET /api/v1/fines/my-fines
 * List current member's fines (Member)
 */
const getMyFines = async (req, res, next) => {
  try {
    const ownMemberId = await getMemberIdForUser(req.user.id);
    if (!ownMemberId) {
      throw new AppError('Member profile not found.', 404);
    }

    const { page, limit, status, search } = req.query;

    const result = await fineModel.findWithPagination({
      page,
      limit,
      status,
      memberId: ownMemberId,
      search,
    });

    return res.status(200).json({
      success: true,
      message: 'My fines retrieved successfully',
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

/**
 * GET /api/v1/fines/:id
 * Retrieve single fine details (Member own, Librarian, Admin)
 */
const getFineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fine = await fineModel.findById(id);
    if (!fine) {
      throw new AppError('Fine record not found', 404);
    }

    // IDOR check: Member can only view own fines
    if (req.user.role === 'member' && fine.member_user_id !== req.user.id) {
      throw new AppError('Forbidden: You do not have permission to view this fine record.', 403);
    }

    return successResponse(res, fine, 'Fine details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/fines/:id/pay
 * Record fine payment (Librarian, Admin)
 */
const payFine = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fine = await fineModel.findById(id);
    if (!fine) {
      throw new AppError('Fine record not found', 404);
    }

    if (fine.status === 'paid') {
      throw new AppError('This fine has already been paid.', 400);
    }
    if (fine.status === 'waived') {
      throw new AppError('Cannot pay a fine that has already been waived.', 400);
    }

    await fineModel.payFine(id, req.user.id);

    // Send receipt notification to member
    await notificationModel.create({
      user_id: fine.member_user_id,
      type: 'fine_paid',
      title: 'บันทึกการชำระค่าปรับเรียบร้อย',
      message: `คุณได้ชำระค่าปรับรหัส ${fine.fine_code} จำนวน ${fine.amount} บาท เรียบร้อยแล้ว`,
      related_entity_type: 'fines',
      related_entity_id: fine.id,
    });

    const updatedFine = await fineModel.findById(id);

    return successResponse(res, updatedFine, 'Fine payment recorded successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/fines/:id/waive
 * Waive fine (Admin only)
 */
const waiveFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      throw new AppError('Waiving reason is required.', 400, [
        { field: 'reason', message: 'Reason for waiving fine must be specified' },
      ]);
    }

    const fine = await fineModel.findById(id);
    if (!fine) {
      throw new AppError('Fine record not found', 404);
    }

    if (fine.status === 'waived') {
      throw new AppError('This fine has already been waived.', 400);
    }
    if (fine.status === 'paid') {
      throw new AppError('Cannot waive a fine that has already been paid.', 400);
    }

    await fineModel.waiveFine(id, reason, req.user.id);

    // Send notification to member
    await notificationModel.create({
      user_id: fine.member_user_id,
      type: 'fine_waived',
      title: 'ยอดค่าปรับได้รับการยกเว้น',
      message: `ยอดค่าปรับรหัส ${fine.fine_code} จำนวน ${fine.amount} บาท ได้รับการยกเว้นโดยผู้ดูแลระบบ (เหตุผล: ${reason.trim()})`,
      related_entity_type: 'fines',
      related_entity_id: fine.id,
    });

    const updatedFine = await fineModel.findById(id);

    return successResponse(res, updatedFine, 'Fine waived successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFines,
  getMyFines,
  getFineById,
  payFine,
  waiveFine,
};
