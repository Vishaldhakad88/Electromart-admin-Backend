const express = require('express');
const router = express.Router();
const { listProducts, updateProductStatus, productsSummary } = require('../controllers/adminProductController');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, listProducts);
router.put('/:id/status', adminAuth, updateProductStatus);
router.get('/summary', adminAuth, productsSummary);

module.exports = router;