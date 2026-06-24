const express = require('express')
const router = express.Router()
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  getShopOrders,
  updateShopOrderStatus,
  getShopAnalytics,
} = require('../controllers/orderController')
const { protect, isAdmin, isShopOwner } = require('../middleware/auth')

router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/', protect, isAdmin, getAllOrders)

// Seller-scoped routes (must come before /:id to avoid route collision)
router.get('/shop/:shopId/analytics', protect, isShopOwner, getShopAnalytics)
router.get('/shop/:shopId', protect, isShopOwner, getShopOrders)

router.get('/:id', protect, getOrder)
router.put('/:id/status', protect, isAdmin, updateOrderStatus)
router.put('/:id/shop-status', protect, isShopOwner, updateShopOrderStatus)

module.exports = router