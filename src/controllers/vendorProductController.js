const Product = require('../models/Product');
const CategoryFieldConfig = require('../models/CategoryFieldConfig');

// Helper: validate specs against category config
function validateSpecs(specs, config) {
  const errors = [];
  const result = {};
  const cfgKeys = (config.fields || []).map(f => f.key);

  // Reject extra keys
  for (const k of Object.keys(specs || {})) {
    if (!cfgKeys.includes(k)) errors.push(`Unsupported spec key: ${k}`);
  }

  // Validate required & types
  for (const f of config.fields || []) {
    const val = specs ? specs[f.key] : undefined;
    if (f.required && (val === undefined || val === null || val === '')) {
      errors.push(`Field ${f.key} is required`);
      continue;
    }

    if (val != null) {
      // Type checks
      if (f.type === 'number' && isNaN(Number(val))) {
        errors.push(`Field ${f.key} must be a number`);
        continue;
      }
      if (f.type === 'select' && f.options && !f.options.includes(val)) {
        errors.push(`Field ${f.key} must be one of: ${f.options.join(',')}`);
        continue;
      }
      if (f.type === 'boolean' && !(val === true || val === false || val === 'true' || val === 'false')) {
        errors.push(`Field ${f.key} must be boolean`);
        continue;
      }
      // Store as string
      result[f.key] = String(val);
    }
  }

  return { errors, result };
}

// POST /api/v1/vendor/products
async function createProduct(req, res) {
  try {
    // vendorAuth ensures req.vendor
    const vendor = req.vendor;
    if (!vendor) return res.status(401).json({ error: 'Unauthorized' });
    if (!vendor.profileCompleted) return res.status(403).json({ error: 'Complete vendor profile before adding products' });

    const {
      title,
      description,
      category,
      brand,
      model,
      price,
      condition,
      usageDuration,
      warrantyRemaining,
      invoiceAvailable,
      knownIssues,
      specs,
      city,
      state,
      negotiable
    } = req.body;

    if (!title || !category || !price) return res.status(400).json({ error: 'Title, category and price are required' });

    // Load category field config
    const cfg = await CategoryFieldConfig.findOne({ category }).exec();
    let parsedSpecs = {};
    if (specs) {
      try {
        parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch (err) {
        return res.status(400).json({ error: 'Invalid specs JSON' });
      }
    }

    if (cfg) {
      const { errors, result } = validateSpecs(parsedSpecs, cfg);
      if (errors.length) return res.status(400).json({ error: errors.join('; ') });
      parsedSpecs = result;
    } else {
      // Reject if any specs provided for uncategorized field configs
      if (Object.keys(parsedSpecs).length > 0) return res.status(400).json({ error: 'No field configuration for this category' });
    }

    const productImages = (req.files && req.files.productImages) ? req.files.productImages.map(f => `/uploads/products/${f.filename}`) : [];
    const invoiceImage = (req.files && req.files.invoiceImage && req.files.invoiceImage[0]) ? `/uploads/products/${req.files.invoiceImage[0].filename}` : '';

    const product = await Product.create({
      title,
      description: description || '',
      category,
      brand: brand || '',
      model: model || '',
      price: Number(price),
      condition: condition || 'used',
      usageDuration: usageDuration || '',
      warrantyRemaining: warrantyRemaining || '',
      invoiceAvailable: invoiceAvailable === 'true' || invoiceAvailable === true,
      knownIssues: knownIssues ? (typeof knownIssues === 'string' ? JSON.parse(knownIssues) : knownIssues) : [],
      specs: parsedSpecs,
      productImages,
      invoiceImage,
      city: city || '',
      state: state || '',
      negotiable: negotiable === 'true' || negotiable === true,
      vendor: vendor._id
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error('[vendorProductController] createProduct error:', err && err.stack ? err.stack : err);
    if (err && err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/v1/vendor/products
async function listOwnProducts(req, res) {
  try {
    const vendor = req.vendor;
    const products = await Product.find({ vendor: vendor._id }).populate('category', 'name');
    res.json({ products });
  } catch (err) {
    console.error('[vendorProductController] listOwnProducts error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/v1/vendor/products/:id
async function getOwnProduct(req, res) {
  try {
    const vendor = req.vendor;
    const { id } = req.params;
    const product = await Product.findById(id).populate('category', 'name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!product.vendor.equals(vendor._id)) return res.status(403).json({ error: 'Forbidden' });
    res.json({ product });
  } catch (err) {
    console.error('[vendorProductController] getOwnProduct error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/v1/vendor/products/:id
async function updateOwnProduct(req, res) {
  try {
    const vendor = req.vendor;
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!product.vendor.equals(vendor._id)) return res.status(403).json({ error: 'Forbidden' });

    const updates = req.body || {};

    if (updates.specs) {
      try {
        updates.specs = typeof updates.specs === 'string' ? JSON.parse(updates.specs) : updates.specs;
      } catch (err) {
        return res.status(400).json({ error: 'Invalid specs JSON' });
      }
      const cfg = await CategoryFieldConfig.findOne({ category: product.category }).exec();
      if (cfg) {
        const { errors, result } = validateSpecs(updates.specs, cfg);
        if (errors.length) return res.status(400).json({ error: errors.join('; ') });
        updates.specs = result;
      } else if (Object.keys(updates.specs).length > 0) {
        return res.status(400).json({ error: 'No field configuration for this category' });
      }
    }

    // Handle image uploads (replace arrays)
    if (req.files && req.files.productImages) {
      updates.productImages = req.files.productImages.map(f => `/uploads/products/${f.filename}`);
    }
    if (req.files && req.files.invoiceImage && req.files.invoiceImage[0]) {
      updates.invoiceImage = `/uploads/products/${req.files.invoiceImage[0].filename}`;
    }

    Object.assign(product, updates);
    await product.save();
    res.json({ product });
  } catch (err) {
    console.error('[vendorProductController] updateOwnProduct error:', err && err.stack ? err.stack : err);
    if (err && err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteOwnProduct(req, res) {
  try {
    const vendor = req.vendor;
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!product.vendor.equals(vendor._id)) return res.status(403).json({ error: 'Forbidden' });

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('[vendorProductController] deleteOwnProduct error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createProduct, listOwnProducts, getOwnProduct, updateOwnProduct, deleteOwnProduct };
