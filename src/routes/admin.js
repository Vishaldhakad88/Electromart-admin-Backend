const express = require('express');
const router = express.Router();
const { me, updateMe } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');
const adminUpload = require('../middleware/adminUpload');

// GET profile
router.get('/me', adminAuth, me);

// UPDATE profile
router.put(
  '/me',
  adminAuth,
  adminUpload.single('profileImage'),
  updateMe
);

// Test protected route (unchanged)
router.get('/protected', adminAuth, (req, res) => {
  res.json({
    ok: true,
    message: 'Protected route access granted',
    admin: { id: req.admin._id, email: req.admin.email }
  });
});

module.exports = router;
