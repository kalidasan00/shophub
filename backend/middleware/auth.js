const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  // Fix: now reads the httpOnly cookie first (how the web frontend sends
  // it after the sendToken change). The Authorization header check is
  // kept as a fallback — useful if you ever add a mobile app or external
  // API client that can't rely on browser cookies. Requires
  // `cookie-parser` to be registered in your Express app:
  //   npm install cookie-parser
  //   app.use(require('cookie-parser')())
  if (req.cookies?.token) {
    token = req.cookies.token
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' })
  }
}

const isShopOwner = (req, res, next) => {
  if (req.user && (req.user.role === 'shopowner' || req.user.role === 'admin')) {
    next()
  } else {
    res.status(403).json({ success: false, message: 'Shop owner access required' })
  }
}

module.exports = { protect, isAdmin, isShopOwner }