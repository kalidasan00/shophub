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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.75rem 1rem', fontFamily: font.family }}>
        <div style={{ height: '14px', width: '160px', backgroundColor: colors.surface, borderRadius: '8px', marginBottom: '0.75rem' }} />
        <div style={{ backgroundColor: colors.white, borderRadius: '14px', border: `1px solid ${colors.border}`, padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', backgroundColor: colors.surface, borderRadius: '10px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '130px', height: '16px', backgroundColor: colors.surface, borderRadius: '6px', marginBottom: '8px' }} />
              <div style={{ width: '180px', height: '11px', backgroundColor: colors.surface, borderRadius: '6px' }} />
            </div>
          </div>
        </div>
        <div className="product-grid">
          {[1,2,3,4].map((i) => (
            <div key={i} style={{ backgroundColor: colors.white, borderRadius: '14px', border: `1px solid ${colors.border}`, aspectRatio: '4/5' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', fontFamily: font.family }}>
        <h2 style={{ fontSize: font.xl, fontWeight: '700', color: colors.dark }}>Shop not found</h2>
        <Link href="/shops" style={{ color: colors.primary, textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>
          Back to Shops
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        @media (min-width: 640px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
        }
        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
        }
        .tab-scroll::-webkit-scrollbar { display: none; }
        .tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: colors.muted, padding: '0.6rem 0' }}>
          <Link href="/" style={{ color: colors.muted, textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/shops" style={{ color: colors.muted, textDecoration: 'none' }}>Shops</Link>
          <span>/</span>
          <span style={{ color: colors.dark, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.name}</span>
        </nav>

        {/* Shop Hero — compact strip */}
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '14px',
          border: `1px solid ${colors.border}`,
          padding: '10px 12px',
          marginBottom: '10px',
          boxShadow: shadow.card,
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            {/* Logo */}
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: shop.color || colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                {shop.icon}
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <h1 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', fontWeight: '700', color: colors.dark, margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {shop.name}
                </h1>
                {shop.badge && <Badge label={shop.badge} variant="primary" />}
              </div>

              {/* Meta row — single line */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                <StarRating rating={shop.rating} reviews={shop.numReviews} size="sm" />

                <span style={{ fontSize: '11.5px', color: colors.muted }}>
                  {products.length} products
                </span>

                {shop.location && (
                  <span style={{ fontSize: '11.5px', color: colors.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {shop.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div style={{ paddingBottom: '2rem' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: '700', color: colors.dark, margin: 0 }}>
              Products
            </h2>
            {totalItems > 0 && (
              <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: colors.primaryLight, color: colors.primary, padding: '4px 10px', borderRadius: radius.full, fontSize: '12px', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>
                🛒 {totalItems}
              </Link>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="tab-scroll" style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '2px' }}>
            {productTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '5px 11px', borderRadius: radius.full, fontSize: '12px', fontWeight: '500', fontFamily: font.family, cursor: 'pointer', border: `1px solid ${activeTab === tab ? colors.primary : colors.border}`, backgroundColor: activeTab === tab ? colors.primary : colors.white, color: activeTab === tab ? colors.white : colors.muted, transition: transition.base, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filtered.length > 0 ? (
            <div className="product-grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{ ...product, id: product._id, reviews: product.numReviews }}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <h3 style={{ fontSize: font.lg, fontWeight: '600', color: colors.dark, marginBottom: '6px', fontFamily: font.family }}>No products found</h3>
              <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '16px', fontFamily: font.family }}>Try a different filter</p>
              <button onClick={() => setActiveTab('All')}
                style={{ backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '8px 20px', fontSize: font.base, fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
                Show All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}