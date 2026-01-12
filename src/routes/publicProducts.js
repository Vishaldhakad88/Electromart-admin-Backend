const express = require('express');
const router = express.Router();
const { listProducts, getProductDetails } = require('../controllers/publicProductController');

router.get('/', listProducts);
router.get('/:id', getProductDetails);

module.exports = router;