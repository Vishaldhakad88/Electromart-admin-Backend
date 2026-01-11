const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

async function vendorAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = auth.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (decoded.role !== 'vendor' || !decoded.vendorId) return res.status(403).json({ error: 'Forbidden' });

  const vendor = await Vendor.findById(decoded.vendorId).select('-password -emailOtp -emailOtpExpires');
  if (!vendor) return res.status(401).json({ error: 'Vendor not found' });
  if (vendor.status === 'blocked') return res.status(403).json({ error: 'Vendor is blocked' });
  if (vendor.status !== 'approved') return res.status(403).json({ error: 'Vendor is not approved' });

  req.vendor = vendor;
  next();
}

module.exports = vendorAuth;