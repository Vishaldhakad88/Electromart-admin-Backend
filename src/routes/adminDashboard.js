const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/adminDashboardController');
const { adminAuth } = require('../middleware/auth');

// Dashboard summary
router.get('/dashboard/summary', adminAuth, getDashboardSummary);

module.exports = router;
