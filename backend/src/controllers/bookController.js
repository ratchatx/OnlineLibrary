'use strict';

const bookModel = require('../models/bookModel');
const bookCopyModel = require('../models/bookCopyModel');
const categoryModel = require('../models/categoryModel');
const { successResponse, paginatedResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Book Controller
 * Reference: docs/planning/06-api-contract.md (Section 11)
 */

/**
 * GET /api/v1/books
 * Search and browse book catalog with filtering, sorting, and pagination (Public)
 */
const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category_id,
      availability,
      author,
      publisher,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const result = await bookModel.findWithPagination({
      search,
      category_id,
      availability,
      author,
      publisher,
      sort,
      order,
      page,
      limit,
    });

    return paginatedResponse(
      res,
      result.books,
      result.pagination,
      'Books retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/books/:id
 * Retrieves detailed book information and copies summary (Public)
 */
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await bookModel.findById(id);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Fetch physical copies overview
    const copies = await bookCopyModel.findByBookId(id);

    return successResponse(
      res,
      {
        ...book,
        copies,
      },
      'Book details retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/books
 * Creates a new bibliographic book record (Librarian, Admin)
 */
const createBook = async (req, res, next) => {
  try {
    const {
      isbn,
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_image_url,
      initial_copies,
    } = req.body;

    // Validation
    const validationErrors = [];
    if (!isbn || isbn.trim() === '') validationErrors.push({ field: 'isbn', message: 'ISBN is required' });
    if (!title || title.trim() === '') validationErrors.push({ field: 'title', message: 'Title is required' });
    if (!author || author.trim() === '') validationErrors.push({ field: 'author', message: 'Author is required' });
    if (!category_id) validationErrors.push({ field: 'category_id', message: 'Category ID is required' });

    if (validationErrors.length > 0) {
      throw new AppError('Validation failed. Please fill in all required fields.', 400, validationErrors);
    }

    // Check ISBN Uniqueness
    const existingIsbn = await bookModel.findByIsbn(isbn);
    if (existingIsbn) {
      throw new AppError(`A book with ISBN '${isbn.trim()}' already exists (ID: ${existingIsbn.id}, Title: '${existingIsbn.title}').`, 409, [
        { field: 'isbn', message: 'ISBN must be unique' },
      ]);
    }

    // Check Category exists
    const category = await categoryModel.findById(category_id);
    if (!category) {
      throw new AppError('Specified category does not exist.', 400, [
        { field: 'category_id', message: 'Invalid category ID' },
      ]);
    }

    // Create Book
    const newBookId = await bookModel.create({
      isbn,
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_image_url,
    });

    // Optional: create initial physical copies if requested
    const copyCount = parseInt(initial_copies, 10) || 0;
    if (copyCount > 0) {
      const sanitizedIsbn = isbn.replace(/[^a-zA-Z0-9]/g, '').slice(-6);
      for (let i = 1; i <= copyCount; i++) {
        const barcode = `BC-${sanitizedIsbn}-${String(i).padStart(3, '0')}`;
        await bookCopyModel.create({
          book_id: newBookId,
          barcode,
          copy_number: i,
          status: 'available',
        });
      }
      await bookModel.recalculateCopies(newBookId);
    }

    const createdBook = await bookModel.findById(newBookId);
    const copies = await bookCopyModel.findByBookId(newBookId);

    return successResponse(
      res,
      {
        ...createdBook,
        copies,
      },
      'Book created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/books/:id
 * Updates an existing book record (Librarian, Admin)
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_image_url,
    } = req.body;

    const book = await bookModel.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Validation
    const validationErrors = [];
    if (!title || title.trim() === '') validationErrors.push({ field: 'title', message: 'Title cannot be empty' });
    if (!author || author.trim() === '') validationErrors.push({ field: 'author', message: 'Author cannot be empty' });
    if (!category_id) validationErrors.push({ field: 'category_id', message: 'Category ID cannot be empty' });

    if (validationErrors.length > 0) {
      throw new AppError('Validation failed.', 400, validationErrors);
    }

    // Check Category exists
    const category = await categoryModel.findById(category_id);
    if (!category) {
      throw new AppError('Specified category does not exist.', 400, [
        { field: 'category_id', message: 'Invalid category ID' },
      ]);
    }

    await bookModel.update(id, {
      title,
      author,
      publisher,
      publish_year,
      category_id,
      description,
      cover_image_url,
    });

    const updatedBook = await bookModel.findById(id);

    return successResponse(res, updatedBook, 'Book updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/books/:id
 * Soft deletes a book record (Librarian, Admin)
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await bookModel.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if any copies are currently borrowed
    const copies = await bookCopyModel.findByBookId(id);
    const borrowedCopies = copies.filter((c) => c.status === 'borrowed');
    if (borrowedCopies.length > 0) {
      throw new AppError(
        `Cannot delete book '${book.title}' because ${borrowedCopies.length} copy/copies are currently borrowed. Return all copies first.`,
        400
      );
    }

    await bookModel.deleteById(id);

    return successResponse(res, null, 'Book deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
