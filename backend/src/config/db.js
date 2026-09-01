'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * MySQL Connection Pool Configuration
 * 
 * Internal Docker: connects via service name "db" at port 3306
 * External/Host: configured via DB_HOST / DB_PORT in .env
 */
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'library_user',
  password: process.env.DB_PASSWORD || 'library_secret',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  decimalNumbers: true,
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test Database Connection
 * Executes a lightweight ping query to verify database availability.
 *
 * @returns {Promise<{ connected: boolean, host: string, name: string, serverTime: string, poolLimit: number }>}
 */
const testConnection = async () => {
  const [result] = await pool.query('SELECT 1 + 1 AS solution, NOW() AS server_time');
  return {
    connected: true,
    host: dbConfig.host,
    port: dbConfig.port,
    name: dbConfig.database,
    serverTime: result[0].server_time,
    connectionLimit: dbConfig.connectionLimit,
  };
};

/**
 * Gracefully close the pool (useful during graceful shutdown)
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔌 MySQL Connection Pool successfully closed');
  } catch (err) {
    console.error('⚠️ Error closing MySQL connection pool:', err.message);
  }
};

module.exports = pool;
module.exports.testConnection = testConnection;
module.exports.closePool = closePool;
module.exports.dbConfig = dbConfig;
