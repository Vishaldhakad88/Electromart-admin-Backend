const Category = require('../models/Category');
const CategoryFieldConfig = require('../models/CategoryFieldConfig');
const slugify = require('slugify');

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ error: 'Category with this name already exists' });

    const category = await Category.create({ name, slug, description: description || '' });
    res.status(201).json({ category });
  } catch (err) {
    console.error('[adminCategoryController] createCategory error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function listCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    console.error('[adminCategoryController] listCategories error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function upsertCategoryFields(req, res) {
  try {
    const { id } = req.params;
    const { fields } = req.body;
    if (!Array.isArray(fields)) return res.status(400).json({ error: 'Fields must be an array' });

    // Basic validation of fields
    for (const f of fields) {
      if (!f || typeof f !== 'object') return res.status(400).json({ error: 'Each field must be an object' });
      if (!f.key || !f.label || !f.type) return res.status(400).json({ error: 'Field key, label and type are required' });
      if (f.type === 'select' && (!Array.isArray(f.options) || f.options.length === 0)) return res.status(400).json({ error: 'Select type fields must have options' });
      if (!['text', 'number', 'select', 'boolean'].includes(f.type)) return res.status(400).json({ error: 'Invalid field type' });
      // Normalize options
      if (f.options && !Array.isArray(f.options)) f.options = [String(f.options)];
    }

    if (!Category.findById) {
      // defensive: ensure Category model is loaded correctly
      return res.status(500).json({ error: 'Category model not available' });
    }

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Use findOneAndUpdate with upsert; ensure we await the promise
    const cfg = await CategoryFieldConfig.findOneAndUpdate(
      { category: category._id },
      { fields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    res.json({ config: cfg });
  } catch (err) {
    console.error('[adminCategoryController] upsertCategoryFields error:', err && err.stack ? err.stack : err);
    // Provide more context if Mongoose validation / cast errors
    if (err && err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    if (err && err.name === 'MongoServerError') return res.status(500).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createCategory, listCategories, upsertCategoryFields };