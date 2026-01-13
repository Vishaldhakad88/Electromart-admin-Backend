const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },

    senderRole: {
      type: String,
      enum: ['user', 'vendor'],
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    // Seen status (future use)
    seenByUser: {
      type: Boolean,
      default: false
    },
    seenByVendor: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
