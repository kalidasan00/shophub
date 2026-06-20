const Product = require('../models/Product')
const Shop = require('../models/Shop')

// @route   GET /api/products
exports.getProducts = async (req, res) => {
  const { shop, category, search, tag, sort, page = 1, limit = 12 } = req.query

  const query = { isActive: true }

  if (shop) query.shop = shop
  if (category) query.category = category
  if (tag) query.tag = tag

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  let sortObj = { createdAt: -1 }
  if (sort === 'price_asc') sortObj = { price: 1 }
  if (sort === 'price_desc') sortObj = { price: -1 }
  if (sort === 'rating') sortObj = { rating: -1 }
  if (sort === 'popular') sortObj = { numReviews: -1 }

  const total = await Product.countDocuments(query)
  const products = await Product.find(query)
    .populate('shop', 'name category')
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    products,
  })
}

// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('shop', 'name category location rating')
    .populate('reviews.user', 'name avatar')

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  res.status(200).json({ success: true, product })
}

// @route   POST /api/products
exports.createProduct = async (req, res) => {
  const shop = await Shop.findById(req.body.shop)

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' })
  }

  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  const product = await Product.create(req.body)
  res.status(201).json({ success: true, product })
}

// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id).populate('shop')

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  if (product.shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true, product })
}

// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('shop')

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  if (product.shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  await product.deleteOne()
  res.status(200).json({ success: true, message: 'Product deleted' })
}

// @route   POST /api/products/:id/review
exports.addReview = async (req, res) => {
  const { rating, comment } = req.body
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user.id
  )

  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'Already reviewed' })
  }

  const review = { user: req.user.id, name: req.user.name, rating: Number(rating), comment }
  product.reviews.push(review)
  product.numReviews = product.reviews.length
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length

  await product.save()
  res.status(201).json({ success: true, message: 'Review added' })
}