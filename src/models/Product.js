const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    price: { type: Number, required: true },
    condition: { type: String, enum: ['new', 'used'], default: 'used' },
    usageDuration: { type: String, default: '' },
    warrantyRemaining: { type: String, default: '' },
    invoiceAvailable: { type: Boolean, default: false },
    knownIssues: { type: [String], default: [] },
    specs: { type: Map, of: String, default: {} },
    productImages: { type: [String], default: [] },
    invoiceImage: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    negotiable: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    blockedReason: { type: String, default: '' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    viewsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
