'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./config/db');
const { successResponse, errorResponse } = require('./utils/response');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { inputSanitizer } = require('./middlewares/sanitizer');
const { apiRateLimiter } = require('./middlewares/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5001;
const isDev = process.env.NODE_ENV !== 'production';

// ============================================================
// Security & Core Middlewares
// ============================================================

// 1. HTTP Security Headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
const rawOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...rawOrigins.map((o) => o.trim().replace(/\/+$/, '')),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.trim().replace(/\/+$/, '');
      if (
        isDev ||
        rawOrigins.includes('*') ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. HTTP Request Logging
app.use(morgan(isDev ? 'dev' : 'combined'));

// 4. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Input Sanitization (XSS & Script Injection Protection)
app.use(inputSanitizer);

// 6. Global API Rate Limiting (200 requests/min per IP)
app.use('/api', apiRateLimiter);

// ============================================================
// Core Endpoints
// ============================================================

/**
 * Health Check Endpoint
 * GET /api/v1/health
 * Returns service health status and active MySQL connection details
 */
app.get('/api/v1/health', async (req, res) => {
  try {
    const dbStatus = await db.testConnection();

    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'Library Backend API is running 🚀',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error) {
    console.error('❌ [HEALTH CHECK FAILURE]', error.message);
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Database connection failed',
      database: {
        connected: false,
        error: isDev ? error.message : 'Unable to connect to database',
      },
    });
  }
});

/**
 * Root Info Endpoint
 * GET /
 */
app.get('/', (req, res) => {
  return successResponse(
    res,
    {
      version: '1.0.0',
      api_base: '/api/v1',
      health: '/api/v1/health',
      environment: process.env.NODE_ENV || 'development',
    },
    '📚 Online Library Management System — Backend API v1.0.0'
  );
});

// ============================================================
// API Routes (v1)
// ============================================================
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bookRoutes = require('./routes/bookRoutes');
const bookCopyRoutes = require('./routes/bookCopyRoutes');
const metadataRoutes = require('./routes/metadataRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const memberRoutes = require('./routes/memberRoutes');
const fineRoutes = require('./routes/fineRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const schedulerService = require('./services/schedulerService');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/copies', bookCopyRoutes);
app.use('/api/v1/metadata', metadataRoutes);
app.use('/api/v1/borrowings', borrowingRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/fines', fineRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit-logs', auditRoutes);

// ============================================================
// Production Static Files & SPA Fallback
// ============================================================
const path = require('path');
const fs = require('fs');

const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));

  // Catch-all handler for React SPA Client-side Routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// ============================================================
// Error Handling Middlewares
// ============================================================

// Catch unmatched routes (404 for API routes)
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// ============================================================
// Server Startup & Graceful Shutdown
// ============================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 Online Library Backend Server Running`);
  console.log(`   Port        : ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB Host     : ${process.env.DB_HOST || 'db'}:${process.env.DB_PORT || '3306'}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log('====================================================');

  // Start background scheduler
  schedulerService.startScheduler(60);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  schedulerService.stopScheduler();
  server.close(async () => {
    console.log('🔌 HTTP Server closed.');
    await db.closePool();
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
