const Order = require('../models/Order')
const Product = require('../models/Product')
const Shop = require('../models/Shop')

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

/* ─────────────────────────────────────────────────────────
   SELLER-SCOPED ENDPOINTS
   ───────────────────────────────────────────────────────── */

// Helper: verify the requesting user owns this shop (or is admin)
async function verifyShopOwnership(shopId, userId, userRole) {
  const shop = await Shop.findById(shopId)
  if (!shop) return { error: 'Shop not found', status: 404 }
  if (shop.owner.toString() !== userId && userRole !== 'admin') {
    return { error: 'Not authorized for this shop', status: 403 }
  }
  return { shop }
}

// @route   GET /api/orders/shop/:shopId
// Returns all orders that contain at least one product from this shop.
// Each order is annotated with shopItems (only the items belonging to this shop)
// and shopSubtotal (revenue from just this shop's items in that order).
exports.getShopOrders = async (req, res) => {
  const { shopId } = req.params

  const ownership = await verifyShopOwnership(shopId, req.user.id, req.user.role)
  if (ownership.error) {
    return res.status(ownership.status).json({ success: false, message: ownership.error })
  }

  // Find all product IDs belonging to this shop
  const shopProducts = await Product.find({ shop: shopId }).select('_id')
  const shopProductIds = shopProducts.map((p) => p._id.toString())

  if (shopProductIds.length === 0) {
    return res.status(200).json({ success: true, orders: [] })
  }

  const orders = await Order.find({ 'items.product': { $in: shopProductIds } })
    .populate('user', 'name email')
    .populate('items.product', 'name icon price shop')
    .sort({ createdAt: -1 })

  const annotated = orders.map((order) => {
    const shopItems = order.items.filter((item) =>
      item.product && shopProductIds.includes(item.product._id.toString())
    )
    const shopSubtotal = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return {
      _id: order._id,
      user: order.user,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      couponCode: order.couponCode,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      shopItems,
      shopSubtotal,
    }
  })

  res.status(200).json({ success: true, orders: annotated })
}

// @route   PUT /api/orders/:id/shop-status
// Allows a shop owner to update the order status, but only if the order
// actually contains one of their products. Admins can always update.
exports.updateShopOrderStatus = async (req, res) => {
  const { orderStatus, shopId } = req.body
  const order = await Order.findById(req.params.id).populate('items.product', 'shop')

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }

  if (req.user.role !== 'admin') {
    const ownership = await verifyShopOwnership(shopId, req.user.id, req.user.role)
    if (ownership.error) {
      return res.status(ownership.status).json({ success: false, message: ownership.error })
    }

    const containsShopProduct = order.items.some(
      (item) => item.product && item.product.shop?.toString() === shopId
    )
    if (!containsShopProduct) {
      return res.status(403).json({ success: false, message: 'This order does not contain products from your shop' })
    }
  }

  order.orderStatus = orderStatus
  if (orderStatus === 'delivered') {
    order.deliveredAt = new Date()
    order.paymentStatus = 'paid'
  }

  await order.save()
  res.status(200).json({ success: true, order })
}

// @route   GET /api/orders/shop/:shopId/analytics
// Returns: total revenue, total orders, total products, low-stock count,
// top-selling products, and revenue grouped by day (last 30 days).
exports.getShopAnalytics = async (req, res) => {
  const { shopId } = req.params

  const ownership = await verifyShopOwnership(shopId, req.user.id, req.user.role)
  if (ownership.error) {
    return res.status(ownership.status).json({ success: false, message: ownership.error })
  }

  const shopProducts = await Product.find({ shop: shopId })
  const shopProductIds = shopProducts.map((p) => p._id.toString())
  const totalProducts = shopProducts.length
  const lowStockCount = shopProducts.filter((p) => p.stock > 0 && p.stock <= 5).length
  const outOfStockCount = shopProducts.filter((p) => p.stock === 0).length

  if (shopProductIds.length === 0) {
    return res.status(200).json({
      success: true,
      analytics: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        topProducts: [],
        revenueByDay: [],
      },
    })
  }

  const orders = await Order.find({ 'items.product': { $in: shopProductIds } })
    .populate('items.product', 'name icon shop')

  let totalRevenue = 0
  const productSales = {} // productId -> { name, icon, unitsSold, revenue }
  const revenueByDayMap = {} // 'YYYY-MM-DD' -> revenue

  for (const order of orders) {
    const shopItems = order.items.filter(
      (item) => item.product && shopProductIds.includes(item.product._id.toString())
    )

    for (const item of shopItems) {
      const itemRevenue = item.price * item.quantity
      totalRevenue += itemRevenue

      const pid = item.product._id.toString()
      if (!productSales[pid]) {
        productSales[pid] = { name: item.product.name, icon: item.product.icon, unitsSold: 0, revenue: 0 }
      }
      productSales[pid].unitsSold += item.quantity
      productSales[pid].revenue += itemRevenue
    }

    if (shopItems.length > 0) {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      const shopOrderRevenue = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      revenueByDayMap[dateKey] = (revenueByDayMap[dateKey] || 0) + shopOrderRevenue
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)

  // Build last 30 days, filling zeros for days with no sales
  const revenueByDay = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    revenueByDay.push({ date: dateKey, revenue: revenueByDayMap[dateKey] || 0 })
  }

  res.status(200).json({
    success: true,
    analytics: {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      topProducts,
      revenueByDay,
    },
  })
}