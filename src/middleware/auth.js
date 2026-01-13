const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = auth.split(' ')[1]; 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach admin basic info to request (ensure admin exists)
    const admin = await Admin.findById(payload.id).select('-password');
    if (!admin) return res.status(401).json({ error: 'Invalid token: admin not found' });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { adminAuth };
