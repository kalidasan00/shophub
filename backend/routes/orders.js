const express = require('express')
const router = express.Router()
const { createOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders } = require('../controllers/orderController')
const { protect, isAdmin } = require('../middleware/auth')

router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/', protect, isAdmin, getAllOrders)
router.get('/:id', protect, getOrder)
router.put('/:id/status', protect, isAdmin, updateOrderStatus)

module.exports = router