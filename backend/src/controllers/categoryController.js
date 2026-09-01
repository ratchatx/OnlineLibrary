'use strict';

const categoryModel = require('../models/categoryModel');
const { successResponse } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Category Controller
 * Reference: docs/planning/06-api-contract.md (Section 12)
 */

/**
 * GET /api/v1/categories
 * Retrieves all book categories (Public)
 */
const getCategories = async (req, res, next) => {
  try {
    const { search } = req.query;
    const categories = await categoryModel.findAll(search);

    return successResponse(res, categories, 'Categories retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/categories/:id
 * Retrieves a single category by ID (Public)
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return successResponse(res, category, 'Category retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/categories
 * Creates a new book category (Librarian, Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent_id } = req.body;

    if (!name || name.trim() === '') {
      throw new AppError('Category name is required', 400, [
        { field: 'name', message: 'Category name cannot be empty' },
      ]);
    }

    // Check duplicate name
    const existing = await categoryModel.findByName(name);
    if (existing) {
      throw new AppError(`Category '${name.trim()}' already exists`, 409, [
        { field: 'name', message: 'Category name must be unique' },
      ]);
    }

    // Check parent exists if provided
    if (parent_id) {
      const parent = await categoryModel.findById(parent_id);
      if (!parent) {
        throw new AppError('Parent category not found', 400, [
          { field: 'parent_id', message: 'Specified parent category does not exist' },
        ]);
      }
    }

    const newId = await categoryModel.create({
      name,
      description,
      parent_id: parent_id ? parseInt(parent_id, 10) : null,
    });

    const newCategory = await categoryModel.findById(newId);

    return successResponse(res, newCategory, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/categories/:id
 * Updates an existing category (Librarian, Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id } = req.body;

    const category = await categoryModel.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (!name || name.trim() === '') {
      throw new AppError('Category name is required', 400, [
        { field: 'name', message: 'Category name cannot be empty' },
      ]);
    }

    // Prevent self-parenting
    if (parent_id && parseInt(parent_id, 10) === parseInt(id, 10)) {
      throw new AppError('A category cannot be its own parent', 400, [
        { field: 'parent_id', message: 'Category cannot set itself as parent' },
      ]);
    }

    // Check duplicate name
    const existing = await categoryModel.findByName(name, id);
    if (existing) {
      throw new AppError(`Category '${name.trim()}' already exists`, 409, [
        { field: 'name', message: 'Category name must be unique' },
      ]);
    }

    // Check parent exists if provided
    if (parent_id) {
      const parent = await categoryModel.findById(parent_id);
      if (!parent) {
        throw new AppError('Parent category not found', 400, [
          { field: 'parent_id', message: 'Specified parent category does not exist' },
        ]);
      }
    }

    await categoryModel.update(id, {
      name,
      description,
      parent_id: parent_id ? parseInt(parent_id, 10) : null,
    });

    const updated = await categoryModel.findById(id);

    return successResponse(res, updated, 'Category updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/categories/:id
 * Soft deletes a category (Librarian, Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category.book_count > 0) {
      throw new AppError(
        `Cannot delete category '${category.name}' because it contains ${category.book_count} active books. Reassign or delete books first.`,
        400
      );
    }

    await categoryModel.deleteById(id);

    return successResponse(res, null, 'Category deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
