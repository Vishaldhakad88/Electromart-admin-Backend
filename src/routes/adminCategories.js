const express = require('express');
const router = express.Router();
const { createCategory, listCategories, upsertCategoryFields } = require('../controllers/adminCategoryController');
const { adminAuth } = require('../middleware/auth');

router.post('/', adminAuth, createCategory);
router.get('/', adminAuth, listCategories);
router.post('/:id/fields', adminAuth, upsertCategoryFields);

module.exports = router;