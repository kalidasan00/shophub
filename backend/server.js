require('express-async-errors')
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

// Route imports
const authRoutes = require('./routes/auth')
const shopRoutes = require('./routes/shops')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ShopHub API is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/shops', shopRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})