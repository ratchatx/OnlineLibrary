'use strict';

const express = require('express');
const auditController = require('../controllers/auditController');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const router = express.Router();

// System Audit Logs are strictly restricted to Admin role
router.use(authGuard, roleGuard('admin'));

router.get('/', auditController.getAuditLogs);

module.exports = router;
