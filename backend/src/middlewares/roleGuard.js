'use strict';

const { AppError } = require('./errorHandler');

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * Restricts endpoint access to specific authorized user roles.
 *
 * @param {...string} allowedRoles - List of permitted roles (e.g., 'admin', 'librarian', 'member')
 * @returns {Function} Express middleware function
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before role verification.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleGuard;
