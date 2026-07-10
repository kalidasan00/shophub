const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')
const Shop = require('../models/Shop')

// Fix: previously nothing in this file was wrapped in try/catch, so any
// thrown error (bad ObjectId, DB hiccup, etc.) became an unhandled
// rejection — depending on Express setup that's either a raw stack trace
// leaking to the client, or a full process crash taking down the API for
// every user. Wrapping every controller means one bad request just
// returns a clean error instead of taking the site down.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

// @route   POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' })
  }

  // Fix: the whole operation now runs in a transaction. Previously, if
  // item 3 of 5 failed the stock check, items 1-2 had already had their
  // stock decremented and saved with no order ever created — inventory
  // silently vanished with nothing to show for it. A transaction makes
  // this all-or-nothing: any failure rolls back every change made so far.
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    let subtotal = 0
    const verifiedItems = []

    for (const item of items) {
      const product = await Product.findById(item.product).session(session)
      if (!product) {
        throw Object.assign(new Error(`Product ${item.product} not found`), { status: 404 })
      }

      // Fix: previously read stock, checked it, then wrote the decrement
      // in a separate save() — two requests for the last unit could both
      // pass the check before either write landed, overselling stock.
      // findOneAndUpdate with the stock check baked into the filter makes
      // the check-and-decrement a single atomic DB operation.
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      )
      if (!updatedProduct) {
        throw Object.assign(new Error(`${product.name} is out of stock`), { status: 400 })
      }

      subtotal += product.price * item.quantity

      // Fix: previously saved the client-submitted `items` array as-is,
      // including whatever `price` the frontend sent. The order *total*
      // was computed from the real DB price, but each line item's stored
      // price was still attacker-controlled — and vendor payouts /
      // analytics are calculated from item.price downstream, so a
      // tampered cart could corrupt vendor revenue, not just the display.
      verifiedItems.push({
        product: product._id,
        name: product.name,
        price: product.price, // always from DB, never from req.body
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      })
    }

    const discount = couponCode === 'SAVE10' ? subtotal * 0.1 : 0
    const shippingCost = subtotal > 50 ? 0 : 9.99
    const total = subtotal - discount + shippingCost

    const [order] = await Order.create(
      [
        {
          user: req.user.id,
          items: verifiedItems,
          shippingAddress,
          paymentMethod,
          subtotal,
          discount,
          shippingCost,
          total,
          couponCode: couponCode || '',
        },
      ],
      { session }
    )

    await session.commitTransaction()
    res.status(201).json({ success: true, order })
  } catch (err) {
    await session.abortTransaction()
    const status = err.status || 500
    res.status(status).json({ success: false, message: err.message || 'Failed to create order' })
  } finally {
    session.endSession()
  }
})

// @route   GET /api/orders/my
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'name icon price')
    .sort({ createdAt: -1 })

  res.status(200).json({ success: true, orders })
})

// @route   GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
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
})

// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
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
})

// @route   GET /api/orders (admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })

  res.status(200).json({ success: true, orders })
})

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
exports.getShopOrders = asyncHandler(async (req, res) => {
  const { shopId } = req.params

  const ownership = await verifyShopOwnership(shopId, req.user.id, req.user.role)
  if (ownership.error) {
    return res.status(ownership.status).json({ success: false, message: ownership.error })
  }

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
})

// @route   PUT /api/orders/:id/shop-status
exports.updateShopOrderStatus = asyncHandler(async (req, res) => {
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
})

// @route   GET /api/orders/shop/:shopId/analytics
exports.getShopAnalytics = asyncHandler(async (req, res) => {
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
  const productSales = {}
  const revenueByDayMap = {}

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
})