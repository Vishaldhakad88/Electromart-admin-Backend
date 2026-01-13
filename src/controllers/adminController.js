const Admin = require('../models/Admin');
const path = require('path');


// GET /api/v1/admin/me
async function me(req, res) {
  res.json({
    admin: {
      _id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name,
      phone: req.admin.phone,
      profileImage: req.admin.profileImage
    }
  });
}


// PUT /api/v1/admin/me
async function updateMe(req, res) {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  const { name, phone } = req.body;

  if (name !== undefined) admin.name = name;
  if (phone !== undefined) admin.phone = phone;

  // profile image
  if (req.file) {
    admin.profileImage = path.join(
      '/uploads/admin',
      req.file.filename
    ).replace(/\\/g, '/');
  }

  await admin.save();

  res.json({
    message: 'Profile updated successfully',
    admin: {
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      phone: admin.phone,
      profileImage: admin.profileImage
    }
  });
}

module.exports = { me, updateMe };
