const express = require('express');
const router = express.Router();
const { createProduct, listOwnProducts, getOwnProduct, updateOwnProduct, deleteOwnProduct } = require('../controllers/vendorProductController');
const vendorAuth = require('../middleware/vendorAuth');
const upload = require('../middleware/productUpload');

// Protected vendor routes
router.post('/', vendorAuth, upload.fields([{ name: 'productImages', maxCount: 5 }, { name: 'invoiceImage', maxCount: 1 }]), createProduct);
router.get('/', vendorAuth, listOwnProducts);
router.get('/:id', vendorAuth, getOwnProduct);
router.put('/:id', vendorAuth, upload.fields([{ name: 'productImages', maxCount: 5 }, { name: 'invoiceImage', maxCount: 1 }]), updateOwnProduct);
router.delete('/:id', vendorAuth, deleteOwnProduct);

module.exports = router;