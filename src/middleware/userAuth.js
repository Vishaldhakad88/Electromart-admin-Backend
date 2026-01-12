const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check role is 'user'
    if (decoded.role !== 'user') {
      return res.status(403).json({ error: 'Forbidden: Invalid user token' });
    }

    // Attach user to request
    req.user = decoded;

    // Update lastActiveAt (non-blocking)
    const User = require('../models/User');
    User.findByIdAndUpdate(decoded.userId, { lastActiveAt: new Date() }).catch(() => {
      /* silent fail for lastActiveAt update */
    });

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = userAuth;
