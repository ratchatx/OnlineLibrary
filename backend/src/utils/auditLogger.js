'use strict';

const db = require('../config/db');

/**
 * Audit Logger Utility
 * Records administrative and critical security actions in audit_logs table
 */
const logAction = async ({
  userId = null,
  action,
  entityName,
  entityId = null,
  oldValues = null,
  newValues = null,
  req = null,
}) => {
  try {
    const ipAddress = req ? req.ip || req.connection?.remoteAddress || null : null;
    const userAgent = req ? req.headers['user-agent'] || null : null;

    await db.query(
      `INSERT INTO audit_logs (
         user_id, action, entity_name, entity_id, 
         old_values, new_values, ip_address, user_agent
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityName,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress ? ipAddress.slice(0, 45) : null,
        userAgent ? userAgent.slice(0, 255) : null,
      ]
    );
  } catch (error) {
    // Non-blocking: log error to console but don't fail user request
    console.error('⚠️ Failed to write audit log:', error.message);
  }
};

module.exports = {
  logAction,
};
