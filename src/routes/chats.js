const express = require('express');
const router = express.Router();

const {
  startChat,
  sendMessage,
  getMessages,
  userChats,
  vendorChats
} = require('../controllers/chatController');

const userAuth = require('../middleware/userAuth');
const vendorAuth = require('../middleware/vendorAuth');
const chatAuth = require('../middleware/chatAuth'); // ✅ NEW PROPER MIDDLEWARE

/**
 * USER starts chat with vendor on product
 * POST /api/v1/chats/start
 */
router.post('/start', userAuth, startChat);

/**
 * USER chat list
 * GET /api/v1/chats/user
 */
router.get('/user', userAuth, userChats);

/**
 * VENDOR chat list
 * GET /api/v1/chats/vendor
 */
router.get('/vendor', vendorAuth, vendorChats);

/**
 * SEND MESSAGE (USER or VENDOR)
 * POST /api/v1/chats/:chatId/messages
 */
router.post('/:chatId/messages', chatAuth, sendMessage);

/**
 * GET MESSAGES (USER or VENDOR)
 * GET /api/v1/chats/:chatId/messages
 */
router.get('/:chatId/messages', chatAuth, getMessages);

module.exports = router;
