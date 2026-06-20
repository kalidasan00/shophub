const Shop = require('../models/Shop')
const Product = require('../models/Product')

// @route   GET /api/shops
exports.getShops = async (req, res) => {
  const { category, search, sort, owner, page = 1, limit = 12 } = req.query

  const query = { isActive: true }

  if (owner) {
    query.owner = owner
  }

  if (category && category !== 'All') {
    query.category = category
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ]
  }

  let sortObj = { createdAt: -1 }
  if (sort === 'rating') sortObj = { rating: -1 }
  if (sort === 'reviews') sortObj = { numReviews: -1 }
  if (sort === 'name') sortObj = { name: 1 }

  const total = await Shop.countDocuments(query)
  const shops = await Shop.find(query)
    .populate('owner', 'name email')
    .populate('productCount')
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    shops,
  })
}

// @route   GET /api/shops/:id
exports.getShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('productCount')

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' })
  }

  res.status(200).json({ success: true, shop })
}

// @route   POST /api/shops
exports.createShop = async (req, res) => {
  req.body.owner = req.user.id
  const shop = await Shop.create(req.body)
  res.status(201).json({ success: true, shop })
}

// @route   PUT /api/shops/:id
exports.updateShop = async (req, res) => {
  let shop = await Shop.findById(req.params.id)

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' })
  }

  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true, shop })
}

// @route   DELETE /api/shops/:id
exports.deleteShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id)

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' })
  }

  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  await shop.deleteOne()
  await Product.deleteMany({ shop: req.params.id })

  res.status(200).json({ success: true, message: 'Shop deleted' })
}

// @route   POST /api/shops/:id/follow
exports.followShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id)

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' })
  }

  const isFollowing = shop.followers.includes(req.user.id)

  if (isFollowing) {
    shop.followers = shop.followers.filter((f) => f.toString() !== req.user.id)
  } else {
    shop.followers.push(req.user.id)
  }

  await shop.save()

  res.status(200).json({
    success: true,
    following: !isFollowing,
    followers: shop.followers.length,
  })
}