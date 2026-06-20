'use client'

import { useState } from 'react'
import Link from 'next/link'
import { use } from 'react'

const productsData = {
  101: { id: 101, name: 'Classic White Tee', price: 29.99, originalPrice: 49.99, rating: 4.7, reviews: 89, icon: '👕', tag: 'Sale', shopId: 1, shopName: 'Urban Threads', category: 'Fashion', description: 'A timeless classic white tee crafted from 100% organic cotton. Soft, breathable and perfect for everyday wear. Available in multiple sizes.', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Black', 'Gray'], stock: 45 },
  102: { id: 102, name: 'Slim Fit Jeans', price: 79.99, originalPrice: null, rating: 4.8, reviews: 134, icon: '👖', tag: 'Popular', shopId: 1, shopName: 'Urban Threads', category: 'Fashion', description: 'Premium slim fit jeans made from stretch denim for maximum comfort. Features a modern cut that looks great on every body type.', sizes: ['28', '30', '32', '34', '36'], colors: ['Blue', 'Black', 'Gray'], stock: 23 },
  201: { id: 201, name: 'Pro Laptop 15"', price: 1299.99, originalPrice: 1499.99, rating: 4.8, reviews: 45, icon: '💻', tag: 'Sale', shopId: 2, shopName: 'TechZone', category: 'Electronics', description: 'Powerful 15-inch laptop with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for professionals and creatives who demand performance.', sizes: [], colors: ['Space Gray', 'Silver'], stock: 12 },
  202: { id: 202, name: 'Wireless Earbuds', price: 89.99, originalPrice: null, rating: 4.7, reviews: 312, icon: '🎧', tag: 'Popular', shopId: 2, shopName: 'TechZone', category: 'Electronics', description: 'Premium wireless earbuds with active noise cancellation, 24hr battery life and crystal clear sound. IPX5 water resistant.', sizes: [], colors: ['Black', 'White', 'Blue'], stock: 67 },
  301: { id: 301, name: 'Organic Salad Mix', price: 8.99, originalPrice: null, rating: 4.9, reviews: 89, icon: '🥗', tag: 'Fresh', shopId: 3, shopName: 'Fresh Bites', category: 'Food', description: 'Fresh organic salad mix sourced daily from local farms. Includes a variety of greens, herbs and edible flowers. Ready to eat.', sizes: ['250g', '500g', '1kg'], colors: [], stock: 30 },
  302: { id: 302, name: 'Artisan Bread', price: 6.99, originalPrice: null, rating: 4.8, reviews: 134, icon: '🍞', tag: 'Popular', shopId: 3, shopName: 'Fresh Bites', category: 'Food', description: 'Freshly baked artisan sourdough bread made with traditional methods. Crispy crust, soft inside. Baked fresh every morning.', sizes: ['Small', 'Medium', 'Large'], colors: [], stock: 18 },
}

const relatedProducts = [
  { id: 102, name: 'Slim Fit Jeans', price: 79.99, icon: '👖', rating: 4.8 },
  { id: 103, name: 'Urban Hoodie', price: 59.99, icon: '🧥', rating: 4.6 },
  { id: 104, name: 'Leather Sneakers', price: 119.99, icon: '👟', rating: 4.9 },
  { id: 105, name: 'Cargo Shorts', price: 44.99, icon: '🩳', rating: 4.5 },
]

export default function ProductPage({ params }) {
  const { id } = use(params)
  const product = productsData[id] || productsData[101]

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const handleAddToCart = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>

      {/* Breadcrumb */}
      <div className="section-padding pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] flex-wrap">
          <Link href="/" className="hover:text-[#6366F1] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shops" className="hover:text-[#6366F1] transition-colors">Shops</Link>
          <span>/</span>
          <Link href={`/shops/${product.shopId}`} className="hover:text-[#6366F1] transition-colors">{product.shopName}</Link>
          <span>/</span>
          <span className="text-[#111111] font-medium">{product.name}</span>
        </div>
      </div>

      {/* Product Main */}
      <div className="section-padding py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Product Image */}
          <div>
            <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] h-72 sm:h-96 flex items-center justify-center text-9xl">
              {product.icon}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center text-3xl cursor-pointer transition-all duration-200 ${i === 1 ? 'border-[#6366F1] bg-[#EEF2FF]' : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#6366F1]'}`}>
                  {product.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium bg-[#EEF2FF] text-[#6366F1] px-3 py-1 rounded-full">{product.tag}</span>
              <span className="text-xs font-medium bg-[#F9FAFB] text-[#6B7280] px-3 py-1 rounded-full border border-[#E5E7EB]">{product.category}</span>
              {discount && (
                <span className="text-xs font-medium bg-red-50 text-red-500 px-3 py-1 rounded-full">{discount}% OFF</span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-[#111111] leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} className={`w-4 h-4 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-[#E5E7EB] fill-[#E5E7EB]'}`} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-[#111111]">{product.rating}</span>
              <span className="text-sm text-[#6B7280]">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#111111]">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-[#6B7280] line-through">${product.originalPrice}</span>
              )}
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[#111111] mb-2">Color: <span className="text-[#6366F1]">{selectedColor}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1] font-medium'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#6366F1]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[#111111] mb-2">Size: <span className="text-[#6366F1]">{selectedSize}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-10 rounded-lg text-sm border transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-[#6366F1] bg-[#6366F1] text-white font-medium'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#6366F1]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-[#111111] mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#111111] hover:border-[#6366F1] transition-all duration-200 text-lg font-medium"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-[#111111]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#111111] hover:border-[#6366F1] transition-all duration-200 text-lg font-medium"
                >
                  +
                </button>
                <span className="text-xs text-[#6B7280]">{product.stock} in stock</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
                }`}
              >
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button className="flex-1 py-3 rounded-xl font-medium text-sm border border-[#E5E7EB] text-[#111111] hover:border-[#6366F1] hover:text-[#6366F1] transition-all duration-200">
                Buy Now
              </button>
            </div>

            {/* Shop Link */}
            <Link
              href={`/shops/${product.shopId}`}
              className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#6366F1] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Sold by <span className="text-[#6366F1] font-medium ml-1">{product.shopName}</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-[#E5E7EB] mb-6">
            {['description', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-all duration-200 border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-[#6366F1] text-[#6366F1]'
                    : 'border-transparent text-[#6B7280] hover:text-[#111111]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="max-w-2xl">
              <p className="text-[#6B7280] leading-relaxed">{product.description}</p>
              <ul className="mt-4 space-y-2">
                {['Premium quality materials', 'Fast & free shipping over $50', '30-day easy returns', '1 year warranty'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              {[
                { name: 'Sarah M.', rating: 5, comment: 'Absolutely love this product! Great quality and fast delivery.', date: '2 days ago' },
                { name: 'James K.', rating: 4, comment: 'Really good quality. Fits perfectly and looks great.', date: '1 week ago' },
                { name: 'Priya S.', rating: 5, comment: 'Exceeded my expectations. Will definitely buy again!', date: '2 weeks ago' },
              ].map((review) => (
                <div key={review.name} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-xs font-semibold text-[#6366F1]">
                        {review.name[0]}
                      </div>
                      <span className="text-sm font-medium text-[#111111]">{review.name}</span>
                    </div>
                    <span className="text-xs text-[#6B7280]">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-[#E5E7EB] fill-[#E5E7EB]'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-[#6B7280]">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-4">
              {[
                { icon: '🚀', title: 'Express Delivery', desc: '1-2 business days — $9.99' },
                { icon: '📦', title: 'Standard Shipping', desc: '3-5 business days — Free over $50' },
                { icon: '🔄', title: 'Easy Returns', desc: '30-day hassle-free returns' },
                { icon: '🌍', title: 'International', desc: '7-14 business days — rates vary' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E5E7EB]">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
                    <p className="text-sm text-[#6B7280]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="heading-md text-[#111111] mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden card-hover group"
              >
                <div className="h-32 bg-[#F9FAFB] flex items-center justify-center text-5xl border-b border-[#E5E7EB] group-hover:bg-[#EEF2FF] transition-colors">
                  {p.icon}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-[#111111] group-hover:text-[#6366F1] transition-colors">{p.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-[#111111]">${p.price}</span>
                    <div className="flex items-center gap-0.5">
                      <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-xs text-[#6B7280]">{p.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}