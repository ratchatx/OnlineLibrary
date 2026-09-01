'use strict';

/**
 * Standard API Response Formatters
 * Reference: docs/planning/06-api-contract.md (Sections 24 & 26)
 */

/**
 * Send standard success response (Single resource or custom object)
 *
 * @param {object} res - Express response object
 * @param {any} data - Payload data
 * @param {string} [message='Success'] - Human-readable success message
 * @param {number} [statusCode=200] - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const responseBody = {
    success: true,
    message,
    ...(data !== null && data !== undefined && { data }),
  };
  return res.status(statusCode).json(responseBody);
};

/**
 * Send standard paginated list response
 *
 * @param {object} res - Express response object
 * @param {Array} data - Array of records
 * @param {object} pagination - Pagination metadata
 * @param {number} pagination.totalRecords - Total records in database
 * @param {number} pagination.currentPage - Current page number (1-indexed)
 * @param {number} pagination.limit - Items per page
 * @param {string} [message='Data retrieved successfully'] - Success message
 * @param {number} [statusCode=200] - HTTP status code
 */
const paginatedResponse = (
  res,
  data = [],
  { totalRecords = 0, currentPage = 1, limit = 10 } = {},
  message = 'Data retrieved successfully',
  statusCode = 200
) => {
  const totalPages = Math.ceil(totalRecords / (limit || 10)) || 1;
  const page = parseInt(currentPage, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total_records: totalRecords,
      current_page: page,
      total_pages: totalPages,
      limit: pageSize,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  });
};

/**
 * Send standard error response
 *
 * @param {object} res - Express response object
 * @param {string} [message='An error occurred'] - Human-readable error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Array|null} [errors=null] - Array of validation/field error objects
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const responseBody = {
    success: false,
    message,
    ...(errors && Array.isArray(errors) && errors.length > 0 && { errors }),
  };
  return res.status(statusCode).json(responseBody);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
};
