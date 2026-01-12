const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true, enum: ['text', 'number', 'select', 'boolean'] },
    options: { type: [String], default: [] },
    required: { type: Boolean, default: false }
  },
  { _id: false }
);

const CategoryFieldConfigSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
    fields: { type: [FieldSchema], default: [] }
  },
  { timestamps: true }
);

const CategoryFieldConfig = mongoose.model('CategoryFieldConfig', CategoryFieldConfigSchema);
module.exports = CategoryFieldConfig;
