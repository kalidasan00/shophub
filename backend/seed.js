require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const Shop = require('./models/Shop')
const Product = require('./models/Product')

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB Connected')
}

const users = [
  { name: 'Admin User', email: 'admin@shophub.com', password: 'admin123', role: 'admin' },
  { name: 'John Fashion', email: 'john@shophub.com', password: 'john123', role: 'shopowner' },
  { name: 'Sara Tech', email: 'sara@shophub.com', password: 'sara123', role: 'shopowner' },
  { name: 'Mike Food', email: 'mike@shophub.com', password: 'mike123', role: 'shopowner' },
  { name: 'Test Customer', email: 'customer@shophub.com', password: 'customer123', role: 'customer' },
]

const getShops = (userIds) => [
  {
    name: 'Urban Threads',
    description: 'Premium urban fashion for the modern lifestyle. Curated collections from top designers and emerging brands.',
    category: 'Fashion',
    owner: userIds[1],
    icon: '👗',
    color: '#FEF3C7',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    location: 'New York',
    badge: 'Top Rated',
    since: '2019',
    rating: 4.8,
    numReviews: 234,
  },
  {
    name: 'TechZone',
    description: 'Your go-to destination for the latest gadgets, laptops, phones and accessories at competitive prices.',
    category: 'Electronics',
    owner: userIds[2],
    icon: '💻',
    color: '#EEF2FF',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
    location: 'San Francisco',
    badge: 'Popular',
    since: '2020',
    rating: 4.7,
    numReviews: 189,
  },
  {
    name: 'Fresh Bites',
    description: 'Fresh, organic and delicious food products delivered right to your door. Farm to table, always.',
    category: 'Food',
    owner: userIds[3],
    icon: '🍔',
    color: '#FEE2E2',
    logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    location: 'Chicago',
    badge: 'New',
    since: '2021',
    rating: 4.9,
    numReviews: 312,
  },
  {
    name: 'Glow Studio',
    description: 'Premium beauty and skincare products for your daily routine. Natural ingredients, stunning results.',
    category: 'Beauty',
    owner: userIds[1],
    icon: '💄',
    color: '#FCE7F3',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    location: 'Los Angeles',
    badge: 'Top Rated',
    since: '2020',
    rating: 4.6,
    numReviews: 156,
  },
  {
    name: 'Sport Arena',
    description: 'Everything you need for your active lifestyle. From gym gear to outdoor equipment.',
    category: 'Sports',
    owner: userIds[2],
    icon: '⚽',
    color: '#D1FAE5',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
    location: 'Houston',
    badge: 'Popular',
    since: '2019',
    rating: 4.5,
    numReviews: 201,
  },
  {
    name: 'Book Nook',
    description: 'Discover your next great read. Fiction, non-fiction, textbooks and rare finds all in one place.',
    category: 'Books',
    owner: userIds[3],
    icon: '📚',
    color: '#FEF9C3',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    location: 'Boston',
    badge: 'Trending',
    since: '2018',
    rating: 4.8,
    numReviews: 278,
  },
  {
    name: 'Home Nest',
    description: 'Beautiful home decor and furniture to make your space feel like home.',
    category: 'Home',
    owner: userIds[1],
    icon: '🏠',
    color: '#E0F2FE',
    logo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    location: 'Seattle',
    badge: 'New',
    since: '2022',
    rating: 4.4,
    numReviews: 134,
  },
  {
    name: 'Toy World',
    description: 'Fun and educational toys for kids of all ages. Safe, durable and loved by children everywhere.',
    category: 'Toys',
    owner: userIds[2],
    icon: '🧸',
    color: '#F3E8FF',
    logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    location: 'Miami',
    badge: 'Popular',
    since: '2020',
    rating: 4.7,
    numReviews: 98,
  },
]

const getProducts = (shopIds) => [
  // Urban Threads
  {
    name: 'Classic White Tee',
    description: 'A timeless classic white tee crafted from 100% organic cotton. Soft, breathable and perfect for everyday wear.',
    price: 29.99, originalPrice: 49.99,
    category: 'Fashion', shop: shopIds[0], icon: '👕',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop',
    ],
    sizes: ['XS','S','M','L','XL','XXL'], colors: ['White','Black','Gray'],
    stock: 45, tag: 'Sale', rating: 4.7, numReviews: 89,
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Premium slim fit jeans made from stretch denim for maximum comfort and style.',
    price: 79.99, originalPrice: null,
    category: 'Fashion', shop: shopIds[0], icon: '👖',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&h=600&fit=crop',
    ],
    sizes: ['28','30','32','34','36'], colors: ['Blue','Black','Gray'],
    stock: 23, tag: 'Popular', rating: 4.8, numReviews: 134,
  },
  {
    name: 'Urban Hoodie',
    description: 'Stay warm and stylish with our premium urban hoodie. Perfect for casual outings.',
    price: 59.99, originalPrice: 89.99,
    category: 'Fashion', shop: shopIds[0], icon: '🧥',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop',
    ],
    sizes: ['S','M','L','XL'], colors: ['Gray','Black','Navy'],
    stock: 34, tag: 'Sale', rating: 4.6, numReviews: 67,
  },
  {
    name: 'Leather Sneakers',
    description: 'Premium leather sneakers with cushioned sole for all-day comfort and street style.',
    price: 119.99, originalPrice: null,
    category: 'Fashion', shop: shopIds[0], icon: '👟',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    ],
    sizes: ['7','8','9','10','11','12'], colors: ['White','Black','Brown'],
    stock: 18, tag: 'Top Rated', rating: 4.9, numReviews: 201,
  },
  {
    name: 'Cargo Shorts',
    description: 'Functional and stylish cargo shorts with multiple pockets. Perfect for summer.',
    price: 44.99, originalPrice: null,
    category: 'Fashion', shop: shopIds[0], icon: '🩳',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&h=600&fit=crop',
    ],
    sizes: ['S','M','L','XL'], colors: ['Khaki','Black','Olive'],
    stock: 56, tag: 'New', rating: 4.5, numReviews: 56,
  },
  {
    name: 'Denim Jacket',
    description: 'Classic denim jacket with modern fit. A wardrobe essential for every season.',
    price: 99.99, originalPrice: 149.99,
    category: 'Fashion', shop: shopIds[0], icon: '🧢',
    images: [
      'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=600&fit=crop',
    ],
    sizes: ['S','M','L','XL','XXL'], colors: ['Blue','Black'],
    stock: 29, tag: 'Sale', rating: 4.8, numReviews: 178,
  },

  // TechZone
  {
    name: 'Pro Laptop 15"',
    description: 'Powerful 15-inch laptop with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for professionals.',
    price: 1299.99, originalPrice: 1499.99,
    category: 'Electronics', shop: shopIds[1], icon: '💻',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop',
    ],
    sizes: [], colors: ['Space Gray','Silver'],
    stock: 12, tag: 'Sale', rating: 4.8, numReviews: 45,
  },
  {
    name: 'Wireless Earbuds',
    description: 'Premium wireless earbuds with active noise cancellation and 24hr battery life.',
    price: 89.99, originalPrice: null,
    category: 'Electronics', shop: shopIds[1], icon: '🎧',
    images: [
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
    ],
    sizes: [], colors: ['Black','White','Blue'],
    stock: 67, tag: 'Popular', rating: 4.7, numReviews: 312,
  },
  {
    name: '4K Monitor',
    description: '27-inch 4K Ultra HD monitor with HDR support and 144Hz refresh rate.',
    price: 449.99, originalPrice: 599.99,
    category: 'Electronics', shop: shopIds[1], icon: '🖥️',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop',
    ],
    sizes: [], colors: ['Black','White'],
    stock: 8, tag: 'Sale', rating: 4.9, numReviews: 67,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile switches for the ultimate typing experience.',
    price: 149.99, originalPrice: null,
    category: 'Electronics', shop: shopIds[1], icon: '⌨️',
    images: [
      'https://images.unsplash.com/photo-1595225476474-63038da7347a?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop',
    ],
    sizes: [], colors: ['Black','White'],
    stock: 34, tag: 'New', rating: 4.6, numReviews: 89,
  },
  {
    name: 'Gaming Mouse',
    description: 'Precision gaming mouse with 16000 DPI sensor and programmable buttons.',
    price: 69.99, originalPrice: null,
    category: 'Electronics', shop: shopIds[1], icon: '🖱️',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
    ],
    sizes: [], colors: ['Black','White'],
    stock: 45, tag: 'Top Rated', rating: 4.8, numReviews: 234,
  },
  {
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader and PD charging.',
    price: 49.99, originalPrice: 79.99,
    category: 'Electronics', shop: shopIds[1], icon: '🔌',
    images: [
      'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&h=600&fit=crop',
    ],
    sizes: [], colors: ['Gray','Silver'],
    stock: 78, tag: 'Sale', rating: 4.5, numReviews: 156,
  },

  // Fresh Bites
  {
    name: 'Organic Salad Mix',
    description: 'Fresh organic salad mix sourced daily from local farms. Ready to eat.',
    price: 8.99, originalPrice: null,
    category: 'Food', shop: shopIds[2], icon: '🥗',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=600&fit=crop',
    ],
    sizes: ['250g','500g','1kg'], colors: [],
    stock: 30, tag: 'Fresh', rating: 4.9, numReviews: 89,
  },
  {
    name: 'Artisan Bread',
    description: 'Freshly baked artisan sourdough bread made with traditional methods.',
    price: 6.99, originalPrice: null,
    category: 'Food', shop: shopIds[2], icon: '🍞',
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc7d?w=600&h=600&fit=crop',
    ],
    sizes: ['Small','Medium','Large'], colors: [],
    stock: 18, tag: 'Popular', rating: 4.8, numReviews: 134,
  },
  {
    name: 'Cold Press Juice',
    description: 'Fresh cold pressed juice made from organic fruits and vegetables. No preservatives.',
    price: 12.99, originalPrice: null,
    category: 'Food', shop: shopIds[2], icon: '🧃',
    images: [
      'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&h=600&fit=crop',
    ],
    sizes: ['250ml','500ml','1L'], colors: [],
    stock: 45, tag: 'New', rating: 4.7, numReviews: 67,
  },
  {
    name: 'Cheese Selection',
    description: 'Premium cheese selection from around the world. Perfect for parties and gifting.',
    price: 24.99, originalPrice: 34.99,
    category: 'Food', shop: shopIds[2], icon: '🧀',
    images: [
      'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&h=600&fit=crop',
    ],
    sizes: ['Small','Large'], colors: [],
    stock: 20, tag: 'Sale', rating: 4.9, numReviews: 45,
  },
  {
    name: 'Pasta Bundle',
    description: 'Authentic Italian pasta bundle with 5 different varieties. Made from durum wheat.',
    price: 14.99, originalPrice: null,
    category: 'Food', shop: shopIds[2], icon: '🍝',
    images: [
      'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&h=600&fit=crop',
    ],
    sizes: ['500g','1kg'], colors: [],
    stock: 60, tag: 'Popular', rating: 4.6, numReviews: 78,
  },
  {
    name: 'Fruit Basket',
    description: 'Fresh seasonal fruit basket sourced from local farms. Perfect for gifting.',
    price: 29.99, originalPrice: null,
    category: 'Food', shop: shopIds[2], icon: '🍎',
    images: [
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=600&fit=crop',
    ],
    sizes: ['Small','Medium','Large'], colors: [],
    stock: 15, tag: 'Fresh', rating: 4.8, numReviews: 112,
  },

  // Glow Studio
  {
    name: 'Vitamin C Serum',
    description: 'Brightening vitamin C serum with hyaluronic acid. Reduces dark spots and boosts glow.',
    price: 39.99, originalPrice: 59.99,
    category: 'Beauty', shop: shopIds[3], icon: '✨',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
    ],
    sizes: ['30ml','50ml'], colors: [],
    stock: 45, tag: 'Sale', rating: 4.8, numReviews: 156,
  },
  {
    name: 'Rose Face Cream',
    description: 'Luxurious rose-infused face cream for deep hydration and anti-aging benefits.',
    price: 49.99, originalPrice: null,
    category: 'Beauty', shop: shopIds[3], icon: '🌹',
    images: [
      'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=600&h=600&fit=crop',
    ],
    sizes: ['50ml','100ml'], colors: [],
    stock: 32, tag: 'Popular', rating: 4.7, numReviews: 98,
  },

  // Sport Arena
  {
    name: 'Yoga Mat Pro',
    description: 'Non-slip premium yoga mat with alignment lines. Extra thick for joint support.',
    price: 59.99, originalPrice: 89.99,
    category: 'Sports', shop: shopIds[4], icon: '🧘',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
    ],
    sizes: ['Standard','XL'], colors: ['Purple','Blue','Black'],
    stock: 34, tag: 'Sale', rating: 4.7, numReviews: 123,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with advanced cushioning technology for long distance runs.',
    price: 129.99, originalPrice: null,
    category: 'Sports', shop: shopIds[4], icon: '👟',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    ],
    sizes: ['7','8','9','10','11'], colors: ['Black','White','Blue'],
    stock: 28, tag: 'Popular', rating: 4.8, numReviews: 201,
  },

  // Book Nook
  {
    name: 'Atomic Habits',
    description: 'The life-changing million copy bestseller by James Clear. Build good habits, break bad ones.',
    price: 18.99, originalPrice: 24.99,
    category: 'Books', shop: shopIds[5], icon: '📗',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
    ],
    sizes: ['Paperback','Hardcover'], colors: [],
    stock: 100, tag: 'Top Rated', rating: 4.9, numReviews: 445,
  },
  {
    name: 'Design Thinking',
    description: 'A comprehensive guide to design thinking and creative problem solving for innovators.',
    price: 22.99, originalPrice: null,
    category: 'Books', shop: shopIds[5], icon: '📘',
    images: [
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=600&fit=crop',
    ],
    sizes: ['Paperback','Hardcover','Ebook'], colors: [],
    stock: 75, tag: 'New', rating: 4.6, numReviews: 89,
  },

  // Home Nest
  {
    name: 'Minimalist Lamp',
    description: 'Elegant minimalist table lamp with warm LED light. Perfect for bedroom or office.',
    price: 79.99, originalPrice: 119.99,
    category: 'Home', shop: shopIds[6], icon: '💡',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop',
    ],
    sizes: ['Small','Large'], colors: ['White','Black','Gold'],
    stock: 22, tag: 'Sale', rating: 4.6, numReviews: 78,
  },
  {
    name: 'Scented Candle Set',
    description: 'Set of 3 luxury scented candles with long burn time. Lavender, vanilla and cedarwood.',
    price: 34.99, originalPrice: null,
    category: 'Home', shop: shopIds[6], icon: '🕯️',
    images: [
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=600&fit=crop',
    ],
    sizes: ['Set of 3','Set of 6'], colors: ['White','Cream'],
    stock: 45, tag: 'Popular', rating: 4.8, numReviews: 134,
  },

  // Toy World
  {
    name: 'Building Blocks Set',
    description: 'Creative building blocks set with 500 pieces. Develops motor skills and creativity in children.',
    price: 49.99, originalPrice: 69.99,
    category: 'Toys', shop: shopIds[7], icon: '🧱',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop',
    ],
    sizes: ['500 pieces','1000 pieces'], colors: ['Multicolor'],
    stock: 38, tag: 'Sale', rating: 4.7, numReviews: 67,
  },
  {
    name: 'Stuffed Teddy Bear',
    description: 'Super soft and cuddly teddy bear made from hypoallergenic materials. Safe for all ages.',
    price: 29.99, originalPrice: null,
    category: 'Toys', shop: shopIds[7], icon: '🧸',
    images: [
      'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&h=600&fit=crop',
    ],
    sizes: ['Small','Medium','Large'], colors: ['Brown','White','Pink'],
    stock: 55, tag: 'Popular', rating: 4.9, numReviews: 112,
  },
]

const seedDB = async () => {
  try {
    await connectDB()

    await User.deleteMany()
    await Shop.deleteMany()
    await Product.deleteMany()
    console.log('✅ Cleared existing data')

    // Create users one by one to trigger pre-save hook properly
    const createdUsers = []
    for (const userData of users) {
      const user = new User(userData)
      await user.save()
      createdUsers.push(user)
    }
    console.log(`✅ Created ${createdUsers.length} users`)

    const userIds = createdUsers.map((u) => u._id)
    const createdShops = await Shop.create(getShops(userIds))
    console.log(`✅ Created ${createdShops.length} shops`)

    const shopIds = createdShops.map((s) => s._id)
    const createdProducts = await Product.create(getProducts(shopIds))
    console.log(`✅ Created ${createdProducts.length} products`)

    console.log('')
    console.log('🎉 Database seeded successfully!')
    console.log('─────────────────────────────')
    console.log('Test accounts:')
    console.log('Admin:    admin@shophub.com    / admin123')
    console.log('Owner:    john@shophub.com     / john123')
    console.log('Customer: customer@shophub.com / customer123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error.message)
    process.exit(1)
  }
}

seedDB()