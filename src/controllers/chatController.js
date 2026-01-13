const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const Product = require('../models/Product');

/**
 * USER starts or gets a chat for a product
 * POST /api/v1/chats/start
 */
async function startChat(req, res) {
  try {
    // 🔒 Safety: user must be authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const user = req.user;
    const { vendorId, productId } = req.body;

    if (!vendorId || !productId) {
      return res.status(400).json({ error: 'vendorId and productId are required' });
    }

    // Ensure product exists and belongs to vendor
    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found for this vendor' });
    }

    // Find existing chat
    let chat = await Chat.findOne({
      user: user._id,
      vendor: vendorId,
      product: productId
    });

    // Create chat if not exists
    if (!chat) {
      chat = await Chat.create({
        user: user._id,
        vendor: vendorId,
        product: productId
      });
    }

    res.json({ chat });
  } catch (err) {
    console.error('[chatController] startChat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Send message (User or Vendor)
 * POST /api/v1/chats/:chatId/messages
 */
async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    if (chat.isBlocked) return res.status(403).json({ error: 'Chat is blocked' });

    let senderRole;
    let senderId;

    // USER sending message
    if (req.user && req.user._id) {
      if (!chat.user.equals(req.user._id)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      senderRole = 'user';
      senderId = req.user._id;
    }
    // VENDOR sending message
    else if (req.vendor && req.vendor._id) {
      if (!chat.vendor.equals(req.vendor._id)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      senderRole = 'vendor';
      senderId = req.vendor._id;
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const msg = await ChatMessage.create({
      chat: chatId,
      senderRole,
      senderId,
      message: message.trim()
    });

    // Update chat preview
    chat.lastMessage = message.trim();
    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(201).json({ message: msg });
  } catch (err) {
    console.error('[chatController] sendMessage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get messages (polling)
 * GET /api/v1/chats/:chatId/messages
 */
async function getMessages(req, res) {
  try {
    const { chatId } = req.params;
    const { after } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Access control
    if (req.user && req.user._id && !chat.user.equals(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.vendor && req.vendor._id && !chat.vendor.equals(req.vendor._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filter = { chat: chatId };
    if (after) {
      filter.createdAt = { $gt: new Date(after) };
    }

    const messages = await ChatMessage.find(filter).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error('[chatController] getMessages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * USER chat list
 * GET /api/v1/chats/user
 */
async function userChats(req, res) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const chats = await Chat.find({ user: req.user._id })
      .populate('product', 'title')
      .populate('vendor', 'name')
      .sort({ lastMessageAt: -1 });

    res.json({ chats });
  } catch (err) {
    console.error('[chatController] userChats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * VENDOR chat list
 * GET /api/v1/chats/vendor
 */
async function vendorChats(req, res) {
  try {
    if (!req.vendor || !req.vendor._id) {
      return res.status(401).json({ error: 'Vendor authentication required' });
    }

    const chats = await Chat.find({ vendor: req.vendor._id })
      .populate('product', 'title')
      .populate('user', 'name')
      .sort({ lastMessageAt: -1 });

    res.json({ chats });
  } catch (err) {
    console.error('[chatController] vendorChats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  startChat,
  sendMessage,
  getMessages,
  userChats,
  vendorChats
};
