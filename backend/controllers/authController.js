const User = require('../models/User')
const jwt = require('jsonwebtoken')

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Send token response
const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
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
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill all fields' })
  }

  const userExists = await User.findOne({ email })
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Email already registered' })
  }

  const user = await User.create({ name, email, password, role: role || 'customer' })
  sendToken(user, 201, res)
}

// @route   POST /api/auth/login
exports.login = async (req, res) => {
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
}

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({ success: true, user })
}

// @route   PUT /api/auth/update
exports.updateProfile = async (req, res) => {
  const { name, phone, address } = req.body
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, address },
    { new: true, runValidators: true }
  )
  res.status(200).json({ success: true, user })
}

// @route   PUT /api/auth/password
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.id).select('+password')

  const isMatch = await user.matchPassword(currentPassword)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' })
  }

  user.password = newPassword
  await user.save()
  sendToken(user, 200, res)
}