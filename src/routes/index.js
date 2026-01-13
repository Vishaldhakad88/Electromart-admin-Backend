const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

router.get('/', (req, res) => {
  res.json({ service: 'ElectroMart Admin API', version: '1.0.0' });
});

// Admin auth routes (public)
router.use('/admin', authRoutes);
// Admin routes (protected)
router.use('/admin', adminRoutes);
// Admin settings routes (protected)
const settingsRoutes = require('./settings');
router.use('/admin/settings', settingsRoutes);

// Admin vendor management (protected)
const vendorRoutes = require('./vendors');
router.use('/admin/vendors', vendorRoutes);

// Public vendor routes (login/profile/set-password)
const vendorPublicRoutes = require('./vendor');
router.use('/vendor', vendorPublicRoutes);

// Public vendor request routes (submit request + verify OTP)
const vendorRequestRoutes = require('./vendorRequests');
router.use('/vendor-requests', vendorRequestRoutes);

// Admin vendor-request management (review/approve/reject)
const adminVendorRequestRoutes = require('./adminVendorRequests');
router.use('/admin/vendor-requests', adminVendorRequestRoutes);

// Admin categories & field configs
const adminCategories = require('./adminCategories');
router.use('/admin/categories', adminCategories);

// Admin products (monitoring & moderation)
const adminProducts = require('./adminProducts');
router.use('/admin/products', adminProducts);

// Public categories
const publicCategories = require('./publicCategories');
router.use('/categories', publicCategories);

// Public products
const publicProducts = require('./publicProducts');
router.use('/products', publicProducts);

// Mount product routes under vendor path: /api/v1/admin/vendors/:vendorId/products
const productRoutes = require('./products');
router.use('/admin/vendors/:vendorId/products', productRoutes);

// Vendor product routes (protected - vendor CRUD on own products)
const vendorProductRoutes = require('./vendorProducts');
router.use('/vendor/products', vendorProductRoutes);

// User auth & profile routes (public signup/login, protected profile endpoints)
const userRoutes = require('./users');
router.use('/users', userRoutes);

// Admin subscription plans (protected)
const plansRoutes = require('./plans');
router.use('/admin/plans', plansRoutes);


// Admin dashboard summary
const adminDashboardRoutes = require('./adminDashboard');
router.use('/admin', adminDashboardRoutes);

// Admin users list
const adminUsersRoutes = require('./adminUsers');
router.use('/admin', adminUsersRoutes);


// Chat routes
const chatRoutes = require('./chats');
router.use('/chats', chatRoutes);


module.exports = router;
