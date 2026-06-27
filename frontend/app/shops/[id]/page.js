'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { MapPin, Star, ShoppingCart, Store } from 'lucide-react'
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
  const brandGradient = `linear-gradient(${g.direction}, ${g.from}, ${g.to})`
  const brandColor = g.from

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

      {/* ── HERO + TABS in one block ── */}
      <div style={{ background: brandGradient, position: 'relative', overflow: 'hidden' }}>

        {/* subtle overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem', position: 'relative' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', padding: '0.6rem 0 1rem' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/shops" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Shops</Link>
            <span>/</span>
            <span style={{ color: '#fff', fontWeight: '500' }}>{shop.name}</span>
          </nav>

          {/* Shop info row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>

            {/* Logo */}
            <div style={{ width: '56px', height: '56px', minWidth: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {shop.logo
                ? <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Store size={26} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
              }
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                  {shop.name}
                </h1>
                {shop.badge && (
                  <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 7px', borderRadius: radius.full, border: '1px solid rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {shop.badge}
                  </span>
                )}
                {totalItems > 0 && (
                  <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '2px 8px', borderRadius: radius.full, fontSize: '11px', fontWeight: '700', textDecoration: 'none' }}>
                    <ShoppingCart size={11} strokeWidth={2.5} /> {totalItems}
                  </Link>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                {shop.rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={11} fill="#FBBF24" color="#FBBF24" />
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#fff' }}>{shop.rating}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>({shop.numReviews})</span>
                  </div>
                )}
                <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.75)' }}>{products.length} products</span>
                {shop.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={11} color="rgba(255,255,255,0.65)" strokeWidth={2} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{shop.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs — sit at bottom of gradient, no gap */}
          <div className="tab-scroll" style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0' }}>
            {productTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 14px',
                  borderRadius: `${radius.full} ${radius.full} 0 0`,
                  fontSize: '12px',
                  fontWeight: activeTab === tab ? '700' : '500',
                  fontFamily: font.family,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === tab ? colors.white : 'rgba(255,255,255,0.12)',
                  color: activeTab === tab ? brandColor : 'rgba(255,255,255,0.8)',
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
      </div>

      {/* ── PRODUCTS — immediately after hero, no gap ── */}
      <div style={{ backgroundColor: g.from + '12', borderTop: 'none' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '12px 1rem 3rem' }}>
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
      <div style={{ height: '160px', background: 'linear-gradient(135deg, #E5E7EB, #D1D5DB)' }} />
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