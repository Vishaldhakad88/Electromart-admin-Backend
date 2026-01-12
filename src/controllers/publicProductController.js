const Product = require('../models/Product');

// GET /api/v1/products
async function listProducts(req, res) {
  try {
    const { category, priceMin, priceMax, condition, city, brand } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (city) filter.city = city;
    if (brand) filter.brand = brand;
    if (priceMin) filter.price = Object.assign(filter.price || {}, { $gte: Number(priceMin) });
    if (priceMax) filter.price = Object.assign(filter.price || {}, { $lte: Number(priceMax) });

    const products = await Product.find(filter).populate('vendor', 'name').populate('category', 'name');
    res.json({ products });
  } catch (err) {
    console.error('[publicProductController] listProducts error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/v1/products/:id
async function getProductDetails(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('vendor', 'name').populate('category', 'name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.status === 'blocked' || product.status !== 'active') return res.status(404).json({ error: 'Product not found' });

    // Increment views count
    product.viewsCount = (product.viewsCount || 0) + 1;
    await product.save();

    res.json({ product });
  } catch (err) {
    console.error('[publicProductController] getProductDetails error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listProducts, getProductDetails };
