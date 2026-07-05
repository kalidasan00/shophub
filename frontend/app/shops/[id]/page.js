'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { MapPin, Star, ShoppingCart, Store, Heart, ChevronLeft } from 'lucide-react'
import useCartStore from '@/store/useCartStore'
import ProductCard from '@/components/ui/ProductCard'
import { shopsAPI, productsAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const productTabs = ['All', 'Popular', 'New', 'Sale', 'Top Rated', 'Fresh']

export default function ShopPage({ params }) {
  const { id } = use(params)
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [saved, setSaved] = useState(false)
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

  if (loading) return <ShopSkeleton />

  if (!shop) return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', fontFamily: font.family }}>
      <h2 style={{ fontSize: font.xl, fontWeight: '700', color: colors.dark }}>Shop not found</h2>
      <Link href="/shops" style={{ color: colors.primary, textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>Back to Shops</Link>
    </div>
  )

  const g = shop.gradient || { from: '#6366F1', to: '#8B5CF6', direction: '135deg' }
  const brandColor = g.from
  const brandGradient = `linear-gradient(${g.direction}, ${g.from}, ${g.to})`
  const hasBanner = Boolean(shop.banner || shop.coverImage)
  const bannerSrc = shop.banner || shop.coverImage
  // Subtle brand wash so the whole page reads as "this shop's space", not just the banner
  const pageTint = `${brandColor}26`

  return (
    <div style={{ minHeight: '100vh', backgroundColor: pageTint, fontFamily: font.family }}>
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

      {/* ── BANNER — real cover photo when the shop has one, brand gradient otherwise ── */}
      <div style={{ position: 'relative', height: 'clamp(160px, 28vw, 220px)', overflow: 'hidden' }}>
        {hasBanner ? (
          <>
            <img src={bannerSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.5) 100%)' }} />
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', background: brandGradient, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 50%)' }} />
          </div>
        )}

        <Link href="/shops" aria-label="Back to shops" style={{ position: 'absolute', top: 14, left: 14, width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color="#fff" />
        </Link>
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
          <button aria-label="Save shop" onClick={() => setSaved(!saved)} style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Heart size={16} color="#fff" fill={saved ? '#fff' : 'none'} />
          </button>
          <Link href="/cart" aria-label="Cart" style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={16} color="#fff" />
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', backgroundColor: brandColor, color: '#fff', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>

        {/* ── Floating shop plaque, overlapping the banner ── */}
        <div style={{ marginTop: '-40px', position: 'relative' }}>
          <div style={{ backgroundColor: colors.white, borderRadius: '18px', padding: '14px 16px', boxShadow: shadow?.md || '0 8px 24px rgba(20,20,43,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '52px', height: '52px', minWidth: '52px', borderRadius: '14px', backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: `1px solid ${colors.border}` }}>
              {shop.logo
                ? <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Store size={22} color={brandColor} strokeWidth={1.5} />
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.35rem)', fontWeight: '800', color: colors.dark, margin: 0, letterSpacing: '-0.01em' }}>
                  {shop.name}
                </h1>
                {shop.badge && (
                  <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: brandColor + '18', color: brandColor, padding: '2px 7px', borderRadius: radius.full, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {shop.badge}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                {shop.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={11} fill="#F59E0B" color="#F59E0B" />
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: colors.dark }}>{shop.rating}</span>
                    <span style={{ fontSize: '11px', color: colors.muted }}>({shop.numReviews})</span>
                  </div>
                )}
                <span style={{ fontSize: '11.5px', color: colors.muted }}>{products.length} products</span>
                {shop.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={11} color={colors.muted} strokeWidth={2} />
                    <span style={{ fontSize: '11px', color: colors.muted }}>{shop.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky tabs ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: pageTint, paddingTop: '14px' }}>
          <div className="tab-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px' }}>
            {productTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 14px',
                  borderRadius: radius.full,
                  fontSize: '12px',
                  fontWeight: activeTab === tab ? '700' : '500',
                  fontFamily: font.family,
                  cursor: 'pointer',
                  border: activeTab === tab ? 'none' : `1px solid ${colors.border}`,
                  backgroundColor: activeTab === tab ? brandColor : colors.white,
                  color: activeTab === tab ? '#fff' : '#5B5B70',
                  transition: transition.base,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCTS ── */}
        <div style={{ paddingBottom: '3rem' }}>
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
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h3 style={{ fontSize: font.lg, fontWeight: '600', color: colors.dark, marginBottom: '6px' }}>No products found</h3>
              <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '16px' }}>Try a different filter</p>
              <button onClick={() => setActiveTab('All')} style={{ backgroundColor: brandColor, color: '#fff', border: 'none', borderRadius: radius.md, padding: '8px 20px', fontSize: font.base, fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
                Show All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShopSkeleton() {
  return (
    <div style={{ fontFamily: font.family }}>
      <div style={{ height: 'clamp(160px, 28vw, 220px)', background: 'linear-gradient(135deg, #E5E7EB, #D1D5DB)' }} />
      <div style={{ backgroundColor: colors.white, padding: '12px 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[1,2,3,4].map((i) => (
            <div key={i} style={{ aspectRatio: '4/5', borderRadius: '14px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}