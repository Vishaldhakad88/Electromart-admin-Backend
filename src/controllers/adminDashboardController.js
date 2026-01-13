const User = require('../models/User');
const Vendor = require('../models/Vendor');
const VendorRequest = require('../models/VendorRequest');
const Category = require('../models/Category');
const Product = require('../models/Product');

// GET /api/v1/admin/dashboard/summary
async function getDashboardSummary(req, res) {
  try {
    const [
      totalUsers,
      activeUsers,
      totalVendors,
      approvedVendors,
      pendingVendorRequests,
      totalCategories,
      activeCategories,
      totalProducts,
      activeProducts,
      blockedProducts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),

      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'approved' }),

      VendorRequest.countDocuments({ status: 'pending', emailVerified: true }),

      Category.countDocuments(),
      Category.countDocuments({ active: true }),

      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'blocked' })
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers
      },
      vendors: {
        total: totalVendors,
        approved: approvedVendors,
        pendingRequests: pendingVendorRequests
      },
      categories: {
        total: totalCategories,
        active: activeCategories
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        blocked: blockedProducts
      }
    });
  } catch (err) {
    console.error('[adminDashboardController] summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getDashboardSummary };
