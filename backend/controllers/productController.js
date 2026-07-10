const Product = require('../models/Product')
const Shop = require('../models/Shop')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

// Fix: createProduct/updateProduct used to pass req.body straight into
// Mongoose, so a vendor could set fields they have no business touching —
// rating, numReviews, reviews (overwrite/wipe them directly), isActive
// (self-approve past moderation), or even shop (reassign the product to
// a shop they don't own, since ownership was only checked against the
// *current* shop). This whitelist matches the actual editable fields in
// models/Product.js; anything else in the request body is silently
// ignored instead of applied.
const EDITABLE_PRODUCT_FIELDS = [
  'name', 'description', 'price', 'originalPrice', 'category',
  'icon', 'images', 'sizes', 'colors', 'stock', 'tag',
]

function pickEditableFields(body) {
  const out = {}
  for (const key of EDITABLE_PRODUCT_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key]
  }
  return out
}

// Fix: `search` was interpolated directly into a $regex. An unbalanced
// pattern (e.g. "product(") threw a regex syntax error and crashed the
// request; a pathological pattern could also make MongoDB spend
// excessive CPU evaluating it (ReDoS) — a cheap denial-of-service vector
// on a public search box. Escaping special characters means the search
// term is always treated as literal text.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// @route   GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const { shop, category, search, tag, sort, page = 1 } = req.query

  // Fix: limit was passed straight to .limit() uncapped — a request like
  // ?limit=999999 forced the DB to return the entire collection.
  const limit = Math.min(Number(req.query.limit) || 12, 100)

  const query = { isActive: true }

  if (shop) query.shop = shop
  if (category) query.category = category
  if (tag) query.tag = tag

  if (search) {
    const safeSearch = escapeRegex(search)
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } },
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
    .limit(limit)

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    products,
  })
})

// @route   GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('shop', 'name category location rating')
    .populate('reviews.user', 'name avatar')

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  res.status(200).json({ success: true, product })
})

// @route   POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.body.shop)

  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' })
  }

  if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  const product = await Product.create({
    ...pickEditableFields(req.body),
    shop: shop._id, // from the verified shop lookup above, never trusted raw from the body
  })
  res.status(201).json({ success: true, product })
})

// @route   PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id).populate('shop')

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  if (product.shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    pickEditableFields(req.body), // shop/rating/numReviews/reviews/isActive can never be touched here
    { new: true, runValidators: true }
  )

  res.status(200).json({ success: true, product })
})

// @route   DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('shop')

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  if (product.shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' })
  }

  await product.deleteOne()
  res.status(200).json({ success: true, message: 'Product deleted' })
})

// @route   POST /api/products/:id/review
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  // Fix: Number(rating) on a missing/non-numeric value becomes NaN.
  // NaN pushed into the reviews array and averaged made product.rating
  // permanently NaN for every future visitor — and Mongoose's min/max
  // validators don't actually catch NaN (NaN < 1 and NaN > 5 are both
  // false, so it silently passes schema validation). Validating here,
  // before touching the product, closes that gap explicitly.
  const numericRating = Number(rating)
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' })
  }
  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ success: false, message: 'Comment is required' })
  }

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

  const review = { user: req.user.id, name: req.user.name, rating: numericRating, comment: comment.trim() }
  product.reviews.push(review)
  product.numReviews = product.reviews.length
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length

  await product.save()
  res.status(201).json({ success: true, message: 'Review added' })
})