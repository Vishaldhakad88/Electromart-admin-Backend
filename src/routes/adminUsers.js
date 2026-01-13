const express = require('express');
const router = express.Router();
const { listUsers } = require('../controllers/adminUserController');
const { adminAuth } = require('../middleware/auth');

// Admin users list
router.get('/users', adminAuth, listUsers);

module.exports = router;
