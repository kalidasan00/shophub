const express = require('express')
const router = express.Router()
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview } = require('../controllers/productController')
const { protect, isShopOwner } = require('../middleware/auth')

router.get('/', getProducts)
router.get('/:id', getProduct)
router.post('/', protect, isShopOwner, createProduct)
router.put('/:id', protect, isShopOwner, updateProduct)
router.delete('/:id', protect, isShopOwner, deleteProduct)
router.post('/:id/review', protect, addReview)

module.exports = router