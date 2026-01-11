const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/vendorAuthController');
const { signup, verifyEmail } = require('../controllers/vendorSignupController');
const vendorAuth = require('../middleware/vendorAuth');

// POST /api/v1/vendor/signup
router.post('/signup', signup);

// POST /api/v1/vendor/verify-email
router.post('/verify-email', verifyEmail);

// POST /api/v1/vendor/login
router.post('/login', login);

// GET /api/v1/vendor/me (protected)
router.get('/me', vendorAuth, me);

module.exports = router;
