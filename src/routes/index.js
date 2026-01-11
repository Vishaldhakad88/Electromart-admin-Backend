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

// Public vendor routes (signup/login/verify)
const vendorPublicRoutes = require('./vendor');
router.use('/vendor', vendorPublicRoutes);

// Mount product routes under vendor path: /api/v1/admin/vendors/:vendorId/products
const productRoutes = require('./products');
router.use('/admin/vendors/:vendorId/products', productRoutes);

// Admin subscription plans (protected)
const plansRoutes = require('./plans');
router.use('/admin/plans', plansRoutes);

module.exports = router;
