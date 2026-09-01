'use strict';

/**
 * Request Input Sanitization Middleware (XSS & Injection Protection)
 * Phase 19: Security Hardening & Production Audit
 */

/**
 * Sanitize a string by stripping dangerous script/HTML injection patterns
 * @param {string} value - String value to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;

  return value
    // Strip <script>...</script> tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip dangerous inline event handlers (onerror=, onload=, onclick=, javascript:)
    .replace(/\b(javascript|data):/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Recursively sanitize an object or array
 * @param {*} data - Input data structure
 * @returns {*} Sanitized data structure
 */
const sanitizeData = (data) => {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === 'object' && !(data instanceof Date)) {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeData(value);
    }
    return sanitizedObj;
  }

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  return data;
};

/**
 * Express Middleware to sanitize req.body, req.query, and req.params
 */
const inputSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeData(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeData(req.params);
  }

  next();
};

module.exports = {
  inputSanitizer,
  sanitizeString,
  sanitizeData,
};
