const Order = require('../models/Order')
const Product = require('../models/Product')

// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' })
  }

  // Calculate prices
  let subtotal = 0
  for (const item of items) {
    const product = await Product.findById(item.product)
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ${item.product} not found` })
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `${product.name} is out of stock` })
    }
    subtotal += product.price * item.quantity
    product.stock -= item.quantity
    await product.save()
  }

  const discount = couponCode === 'SAVE10' ? subtotal * 0.1 : 0
  const shippingCost = subtotal > 50 ? 0 : 9.99
  const total = subtotal - discount + shippingCost

  const order = await Order.create({
    user: req.user.id,
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    discount,
    shippingCost,
    total,
    couponCode: couponCode || '',
  })

  res.status(201).json({ success: true, order })
}

// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'name icon price')
    .sort({ createdAt: -1 })

  res.status(200).json({ success: true, orders })
}

// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name icon price')

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }

  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  res.status(200).json({ success: true, order })
}

// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }

  order.orderStatus = orderStatus
  if (orderStatus === 'delivered') {
    order.deliveredAt = new Date()
    order.paymentStatus = 'paid'
  }

  await order.save()
  res.status(200).json({ success: true, order })
}

// @route   GET /api/orders (admin)
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })

  res.status(200).json({ success: true, orders })
}