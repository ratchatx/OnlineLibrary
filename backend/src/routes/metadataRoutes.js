'use strict';

const express = require('express');
const metadataController = require('../controllers/metadataController');

const router = express.Router();

/**
 * Public Metadata Routes
 */
router.get('/authors', metadataController.getAuthors);
router.get('/publishers', metadataController.getPublishers);

module.exports = router;
