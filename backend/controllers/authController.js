const User = require('../models/User')
const jwt = require('jsonwebtoken')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Fix: token used to be returned in the JSON body for the frontend to
// store in localStorage, which any injected script (XSS) can read. It's
// now set as an httpOnly cookie instead — JavaScript on the page can't
// access it at all, even if an XSS hole exists elsewhere on the site.
// `secure` is on in production so the cookie only ever travels over
// HTTPS.
//
// Fix: sameSite was 'strict', which is the most restrictive setting —
// across browsers this is known to unreliably block the cookie from
// being sent on requests between different ports on localhost (e.g.
// frontend on :3000, backend on :5000), even though they share the
// same domain. That's exactly this setup, and it's why login appeared
// to succeed (200 + user in the response) but every subsequent request
// came back 401 — the cookie was set but the browser wouldn't attach it
// on the next request. 'lax' still blocks genuinely cross-site requests
// (CSRF protection intact) but works reliably for this same-domain,
// different-port local dev setup. This is the standard recommendation
// for this exact frontend/backend split.
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // keep in sync with JWT_EXPIRE

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id)

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
  })

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  })
}

// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  // Fix: `role` used to be read straight from req.body, so anyone could
  // register with { "role": "admin" } and grant themselves full admin
  // access. Public registration is now hardcoded to 'customer' — the
  // only supported way to become a seller is the existing becomeSeller
  // endpoint, and admin accounts should only be created by an existing
  // admin through a separate protected route, never here.

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill all fields' })
  }

  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Email already registered' })
  }

  const user = await User.create({ name, email, password, role: 'customer' })
  sendToken(user, 201, res)
})

// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' })
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  sendToken(user, 200, res)
})

// @route   POST /api/auth/logout
// New: previously there was no way to actually clear the httpOnly
// cookie from the client (JS can't delete an httpOnly cookie directly).
// The frontend now needs to call this on logout.
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
  })
  res.status(200).json({ success: true, message: 'Logged out' })
})

// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    // Fix: previously returned { success: true, user: null } if the
    // account was deleted after the JWT was issued (token stays valid
    // until it expires) — now returns a proper 404 instead.
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  res.status(200).json({ success: true, user })
})

// @route   PUT /api/auth/update
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, address },
    { new: true, runValidators: true }
  )
  res.status(200).json({ success: true, user })
})

// @route   PUT /api/auth/password
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.id).select('+password')

  const isMatch = await user.matchPassword(currentPassword)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' })
  }

  user.password = newPassword
  await user.save()
  sendToken(user, 200, res)
})

// @route   PUT /api/auth/become-seller
exports.becomeSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  if (user.role === 'shopowner' || user.role === 'admin') {
    return sendToken(user, 200, res)
  }

  user.role = 'shopowner'
  await user.save()

  sendToken(user, 200, res)
})