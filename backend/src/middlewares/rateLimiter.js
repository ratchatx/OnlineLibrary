'use strict';

/**
 * In-Memory Sliding Window Rate Limiter Middleware
 * Phase 19: Security Hardening & Production Audit
 */

/**
 * Create a rate limiting middleware
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000ms = 1 min)
 * @param {number} options.max - Maximum allowed requests within windowMs (default: 60)
 * @param {string} [options.message] - Custom message on rate limit exceeded
 * @returns {Function} Express middleware function
 */
const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Too many requests from this IP, please try again later.',
} = {}) => {
  const hits = new Map();

  // Periodic cleanup of expired records every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now - record.startTime > windowMs) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow Node.js process to exit cleanly without waiting on cleanup interval
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // In test environment, allow bypassing if header present
    if (process.env.NODE_ENV === 'test' && req.headers['x-bypass-rate-limit']) {
      return next();
    }

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown';

    const now = Date.now();
    const record = hits.get(clientIp);

    if (!record || now - record.startTime > windowMs) {
      hits.set(clientIp, {
        startTime: now,
        count: 1,
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    record.count += 1;
    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.startTime + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);

      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
};

/**
 * Strict Rate Limiter for Authentication Endpoints (Brute-force protection)
 * 10 requests per minute per IP
 */
const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 attempts per minute
  message: 'Too many authentication attempts. Please try again after 1 minute.',
});

/**
 * General API Rate Limiter
 * 200 requests per minute per IP
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200,            // 200 requests per minute
  message: 'Too many API requests from this IP. Please slow down.',
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
};
