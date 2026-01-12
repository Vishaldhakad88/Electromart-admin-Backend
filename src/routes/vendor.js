const express = require('express');
const router = express.Router();
const { login, me, setPassword } = require('../controllers/vendorAuthController');
const { getProfile, updateProfile } = require('../controllers/vendorProfileController');
const vendorAuth = require('../middleware/vendorAuth');
const upload = require('../middleware/vendorUpload');
const { createPublicLimiter } = require('../middleware/rateLimiter');

const limiter = createPublicLimiter();

// POST /api/v1/vendor/set-password (first time only)
router.post('/set-password', limiter, setPassword);

// POST /api/v1/vendor/login
router.post('/login', limiter, login);

// GET /api/v1/vendor/me (protected)
router.get('/me', vendorAuth, me);

// GET /api/v1/vendor/profile (protected)
router.get('/profile', vendorAuth, getProfile);

// PUT /api/v1/vendor/profile (protected, multipart/form-data)
router.put('/profile', vendorAuth, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'shopImages', maxCount: 5 }
]), updateProfile);

// Vendor products (protected)
const vendorProductsRoutes = require('./vendorProducts');
router.use('/products', vendorProductsRoutes);

module.exports = router;
