const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/userAuthController');
const { getProfile, updateProfile } = require('../controllers/userProfileController');
const userAuth = require('../middleware/userAuth');
const userUpload = require('../middleware/userUpload');
const { createPublicLimiter } = require('../middleware/rateLimiter');

const publicLimiter = createPublicLimiter();

// Public routes
router.post('/signup', publicLimiter, signup);
router.post('/login', publicLimiter, login);

// Protected routes (require authentication)
router.get('/me', userAuth, getProfile);
router.put('/me', userAuth, userUpload.single('profileImage'), updateProfile);

module.exports = router;
