const User = require('../models/User');

// GET /api/v1/admin/users
async function listUsers(req, res) {
  try {
    const { page = 1, limit = 20, q, active } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-password'),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (err) {
    console.error('[adminUserController] listUsers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listUsers };
