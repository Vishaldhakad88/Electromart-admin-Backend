const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// =====================
// GET USER PROFILE
// =====================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: user.toJSON()
    });
  } catch (err) {
    console.error('[userProfileController] getProfile error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// =====================
// UPDATE USER PROFILE
// =====================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, addressLine1, city, state, pincode } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update text fields (only update if provided)
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Update address if any field provided
    if (addressLine1 || city || state || pincode) {
      user.address = user.address || {};
      if (addressLine1) user.address.line1 = addressLine1;
      if (city) user.address.city = city;
      if (state) user.address.state = state;
      if (pincode) user.address.pincode = pincode;
    }

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if it exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '../../uploads/users', path.basename(user.profileImage));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Store new image path (relative for API consumption)
      user.profileImage = `/uploads/users/${req.file.filename}`;
    }

    // Save user
    await user.save();

    console.log(`[userProfileController] Profile updated: ${user.email}`);

    res.status(200).json({
      user: user.toJSON()
    });
  } catch (err) {
    console.error('[userProfileController] updateProfile error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
