const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

async function chatAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // USER TOKEN
    if (decoded.role === 'user') {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ error: 'User not found' });
      req.user = user;
      return next();
    }

    // VENDOR TOKEN
    if (decoded.role === 'vendor') {
      const vendor = await Vendor.findById(decoded.vendorId);
      if (!vendor) return res.status(401).json({ error: 'Vendor not found' });
      if (vendor.status !== 'approved') {
        return res.status(403).json({ error: 'Vendor not approved' });
      }
      req.vendor = vendor;
      return next();
    }

    return res.status(403).json({ error: 'Invalid token role' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = chatAuth;
