'use strict';

const bookCopyModel = require('../models/bookCopyModel');
const bookModel = require('../models/bookModel');
const { successResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Book Copy Controller
 * Reference: docs/planning/06-api-contract.md (Section 14)
 */

/**
 * GET /api/v1/books/:book_id/copies
 * Retrieves all physical copies of a specific book (Librarian, Admin)
 */
const getCopiesByBookId = async (req, res, next) => {
  try {
    const { book_id } = req.params;

    const book = await bookModel.findById(book_id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const copies = await bookCopyModel.findByBookId(book_id);

    return successResponse(
      res,
      {
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          total_copies: book.total_copies,
          available_copies: book.available_copies,
        },
        copies,
      },
      'Book copies retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/books/:book_id/copies
 * Adds a new physical copy to a book (Librarian, Admin)
 */
const addCopy = async (req, res, next) => {
  try {
    const { book_id } = req.params;
    const { barcode, copy_number, status = 'available' } = req.body;

    const book = await bookModel.findById(book_id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (!barcode || barcode.trim() === '') {
      throw new AppError('Barcode is required', 400, [
        { field: 'barcode', message: 'Barcode cannot be empty' },
      ]);
    }

    // Check duplicate barcode
    const existingBarcode = await bookCopyModel.findByBarcode(barcode);
    if (existingBarcode) {
      throw new AppError(`Barcode '${barcode.trim()}' is already in use by copy ID ${existingBarcode.id} (Book: '${existingBarcode.book_title}').`, 409, [
        { field: 'barcode', message: 'Barcode must be unique' },
      ]);
    }

    // Validate status
    const allowedStatuses = ['available', 'maintenance', 'lost'];
    if (status && !allowedStatuses.includes(status)) {
      throw new AppError(`Invalid status '${status}'. Allowed statuses on creation: ${allowedStatuses.join(', ')}`, 400);
    }

    // Auto-generate copy_number if not provided
    const nextNum = copy_number ? parseInt(copy_number, 10) : await bookCopyModel.getNextCopyNumber(book_id);

    const newCopyId = await bookCopyModel.create({
      book_id,
      barcode,
      copy_number: nextNum,
      status: status || 'available',
    });

    // Synchronize parent book counters
    await bookModel.recalculateCopies(book_id);

    const createdCopy = await bookCopyModel.findById(newCopyId);

    return successResponse(res, createdCopy, 'Physical book copy added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/copies/barcode/:barcode
 * Finds physical copy details by barcode (Librarian, Admin)
 */
const getCopyByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const copy = await bookCopyModel.findByBarcode(barcode);

    if (!copy) {
      throw new AppError(`Book copy with barcode '${barcode}' not found`, 404);
    }

    return successResponse(res, copy, 'Book copy found', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/copies/:id/status
 * Updates the physical status of a copy (Librarian, Admin)
 */
const updateCopyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const copy = await bookCopyModel.findById(id);
    if (!copy) {
      throw new AppError('Book copy not found', 404);
    }

    const allowedStatuses = ['available', 'maintenance', 'lost', 'borrowed', 'reserved_hold'];
    if (!status || !allowedStatuses.includes(status)) {
      throw new AppError(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`, 400, [
        { field: 'status', message: `Must be one of: ${allowedStatuses.join(', ')}` },
      ]);
    }

    await bookCopyModel.updateStatus(id, status);

    // Synchronize parent book counters
    await bookModel.recalculateCopies(copy.book_id);

    const updatedCopy = await bookCopyModel.findById(id);

    return successResponse(res, updatedCopy, `Book copy status updated to '${status}'`, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/copies/:id
 * Deletes a physical copy if it has never been borrowed (Librarian, Admin)
 */
const deleteCopy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const copy = await bookCopyModel.findById(id);
    if (!copy) {
      throw new AppError('Book copy not found', 404);
    }

    if (copy.status === 'borrowed') {
      throw new AppError('Cannot delete a copy that is currently borrowed. Process return first.', 400);
    }

    const hasHistory = await bookCopyModel.hasBorrowingHistory(id);
    if (hasHistory) {
      throw new AppError(
        'Cannot delete a copy that has historical borrowing records (Foreign Key integrity). Set status to \'maintenance\' or \'lost\' instead.',
        400
      );
    }

    await bookCopyModel.deleteById(id);

    // Synchronize parent book counters
    await bookModel.recalculateCopies(copy.book_id);

    return successResponse(res, null, 'Physical book copy deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCopiesByBookId,
  addCopy,
  getCopyByBarcode,
  updateCopyStatus,
  deleteCopy,
};
