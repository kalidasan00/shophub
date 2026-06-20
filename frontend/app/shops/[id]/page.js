'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import useCartStore from '@/store/useCartStore'
import ProductCard from '@/components/ui/ProductCard'
import Badge from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'
import { shopsAPI, productsAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const productTabs = ['All', 'Popular', 'New', 'Sale', 'Top Rated', 'Fresh']

export default function ShopPage({ params }) {
  const { id } = use(params)
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [followHovered, setFollowHovered] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [shopRes, productsRes] = await Promise.all([
          shopsAPI.getOne(id),
          productsAPI.getByShop(id),
        ])
        setShop(shopRes.data.shop)
        setProducts(productsRes.data.products)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const filtered = activeTab === 'All'
    ? products
    : products.filter((p) => p.tag === activeTab)

  const handleAddToCart = (product) => {
    addItem({ ...product, id: product._id })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: font.family }}>
        {/* Skeleton */}
        <div style={{ height: '20px', width: '200px', backgroundColor: colors.surface, borderRadius: '8px', marginBottom: '2rem' }} />
        <div style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: colors.surface, borderRadius: '18px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '200px', height: '24px', backgroundColor: colors.surface, borderRadius: '8px', marginBottom: '12px' }} />
              <div style={{ width: '300px', height: '14px', backgroundColor: colors.surface, borderRadius: '8px', marginBottom: '8px' }} />
              <div style={{ width: '250px', height: '14px', backgroundColor: colors.surface, borderRadius: '8px' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, height: '280px' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', fontFamily: font.family }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
        <h2 style={{ fontSize: font.xl, fontWeight: '700', color: colors.dark }}>Shop not found</h2>
        <Link href="/shops" style={{ color: colors.primary, textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>
          Back to Shops
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: font.base, color: colors.muted, padding: '1.5rem 0' }}>
          <Link href="/" style={{ color: colors.muted, textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}>
            Home
          </Link>
          <span style={{ color: colors.border }}>/</span>
          <Link href="/shops" style={{ color: colors.muted, textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}>
            Shops
          </Link>
          <span style={{ color: colors.border }}>/</span>
          <span style={{ color: colors.dark, fontWeight: '500' }}>{shop.name}</span>
        </nav>

        {/* Shop Hero */}
        <div style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: '2rem', boxShadow: shadow.card }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>

            {/* Logo or Icon */}
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                style={{ width: '80px', height: '80px', borderRadius: '18px', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '18px', backgroundColor: shop.color || colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0 }}>
                {shop.icon}
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: '800', color: colors.dark, letterSpacing: '-0.01em' }}>
                  {shop.name}
                </h1>
                {shop.badge && <Badge label={shop.badge} variant="primary" />}
              </div>
              <p style={{ fontSize: '14px', color: colors.muted, lineHeight: '1.6', marginBottom: '16px', maxWidth: '520px' }}>
                {shop.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <StarRating rating={shop.rating} reviews={shop.numReviews} size="md" />

                {shop.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: font.base, color: colors.muted }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {shop.location}
                  </div>
                )}

                {shop.since && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: font.base, color: colors.muted }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Since {shop.since}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: font.base, color: colors.muted }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {products.length} products
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <button
              onMouseEnter={() => setFollowHovered(true)}
              onMouseLeave={() => setFollowHovered(false)}
              style={{ padding: '10px 24px', borderRadius: radius.md, fontSize: font.base, fontWeight: '600', fontFamily: font.family, cursor: 'pointer', border: `1px solid ${colors.border}`, backgroundColor: followHovered ? colors.surface : colors.white, color: followHovered ? colors.primary : colors.dark, transition: transition.base, flexShrink: 0, alignSelf: 'flex-start' }}
            >
              Follow Shop
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div style={{ paddingBottom: '4rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', fontWeight: '700', color: colors.dark }}>
              Products
            </h2>
            {totalItems > 0 && (
              <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: colors.primaryLight, color: colors.primary, padding: '8px 16px', borderRadius: radius.lg, fontSize: font.base, fontWeight: '500', textDecoration: 'none' }}>
                🛒 {totalItems} item{totalItems > 1 ? 's' : ''} in cart
              </Link>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {productTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '7px 16px', borderRadius: radius.full, fontSize: font.base, fontWeight: '500', fontFamily: font.family, cursor: 'pointer', border: `1px solid ${activeTab === tab ? colors.primary : colors.border}`, backgroundColor: activeTab === tab ? colors.primary : colors.white, color: activeTab === tab ? colors.white : colors.muted, transition: transition.base }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {filtered.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{ ...product, id: product._id, reviews: product.numReviews }}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
              <h3 style={{ fontSize: font.lg, fontWeight: '600', color: colors.dark, marginBottom: '8px', fontFamily: font.family }}>No products found</h3>
              <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '20px', fontFamily: font.family }}>Try a different filter</p>
              <button onClick={() => setActiveTab('All')}
                style={{ backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '10px 24px', fontSize: font.base, fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
                Show All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}