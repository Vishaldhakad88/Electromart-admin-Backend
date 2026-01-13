const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    // Last message preview (for chat list)
    lastMessage: {
      type: String,
      default: ''
    },
    lastMessageAt: {
      type: Date,
      default: null
    },

    // Moderation
    isBlocked: {
      type: Boolean,
      default: false
    },
    blockedBy: {
      type: String,
      enum: ['admin', 'vendor', null],
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Ensure ONLY ONE chat per (user + vendor + product)
ChatSchema.index(
  { user: 1, vendor: 1, product: 1 },
  { unique: true }
);

module.exports = mongoose.model('Chat', ChatSchema);
