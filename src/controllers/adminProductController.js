const Product = require('../models/Product');

// GET /api/v1/admin/products
async function listProducts(req, res) {
  const { vendorId, categoryId, status } = req.query;
  const filter = {};
  if (vendorId) filter.vendor = vendorId;
  if (categoryId) filter.category = categoryId;
  if (status) filter.status = status;

  const products = await Product.find(filter).populate('vendor', 'name email').populate('category', 'name');
  res.json({ products });
}

// PUT /api/v1/admin/products/:id/status
async function updateProductStatus(req, res) {
  const { id } = req.params;
  const { status, reason } = req.body;
  if (!status || !['active', 'inactive', 'blocked'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.status = status;
  product.blockedReason = status === 'blocked' ? (reason || '') : '';
  await product.save();

  res.json({ product });
}

// GET /api/v1/admin/products/summary
async function productsSummary(req, res) {
  const total = await Product.countDocuments();
  const perVendor = await Product.aggregate([
    { $group: { _id: '$vendor', count: { $sum: 1 } } },
    { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
    { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } },
    { $project: { vendor: { id: '$vendor._id', email: '$vendor.email', name: '$vendor.name' }, count: 1 } }
  ]);

  const statusCounts = await Product.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json({ total, perVendor, statusCounts });
}

module.exports = { listProducts, updateProductStatus, productsSummary };