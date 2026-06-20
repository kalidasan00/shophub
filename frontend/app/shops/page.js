'use client'

import { useState, useEffect } from 'react'
import ShopCard from '@/components/ui/ShopCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { shopsAPI } from '@/lib/api'
import { colors, font, radius } from '@/lib/styles'

const categories = ['All', 'Fashion', 'Electronics', 'Food', 'Beauty', 'Sports', 'Books', 'Home', 'Toys']
const sortOptions = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
  { label: 'Name A-Z', value: 'name' },
]

export default function ShopsPage() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true)
        const res = await shopsAPI.getAll({
          category: activeCategory !== 'All' ? activeCategory : undefined,
          search: search || undefined,
          sort: sortBy,
        })
        setShops(res.data.shops)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(fetchShops, 300)
    return () => clearTimeout(timeout)
  }, [activeCategory, search, sortBy])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>

      {/* Page Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem' }}>
          <span style={{ fontSize: font.xs, fontWeight: '700', letterSpacing: '0.08em', color: colors.primary, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Marketplace
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', color: colors.dark, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            All Shops
          </h1>
          <p style={{ fontSize: '15px', color: colors.muted, lineHeight: '1.6' }}>
            Browse shops across all categories
          </p>

          {/* Search */}
          <div style={{ position: 'relative', marginTop: '1.75rem', maxWidth: '520px' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search shops, categories, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '12px 14px 12px 44px', fontSize: '15px', fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Filters Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: '8px 16px', borderRadius: radius.full, fontSize: font.base, fontWeight: '500', fontFamily: font.family, cursor: 'pointer', border: `1px solid ${activeCategory === cat ? colors.primary : colors.border}`, backgroundColor: activeCategory === cat ? colors.primary : colors.white, color: activeCategory === cat ? colors.white : '#4B5563', transition: 'all 0.2s ease' }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: font.base, color: colors.muted, fontFamily: font.family }}>Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '10px 14px', fontSize: font.base, fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, cursor: 'pointer', minWidth: '160px' }}>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <p style={{ fontSize: font.base, color: colors.muted, fontFamily: font.family }}>
            Showing <span style={{ fontWeight: '600', color: colors.dark }}>{shops.length}</span> shops
            {activeCategory !== 'All' && <span> in <span style={{ fontWeight: '600', color: colors.primary }}>{activeCategory}</span></span>}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '20px', height: '180px', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: colors.surface, borderRadius: '14px', marginBottom: '16px' }} />
                <div style={{ width: '60%', height: '16px', backgroundColor: colors.surface, borderRadius: '8px', marginBottom: '8px' }} />
                <div style={{ width: '40%', height: '12px', backgroundColor: colors.surface, borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={{ ...shop, id: shop._id, reviews: shop.numReviews, products: shop.productCount || 0 }} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: font.lg, fontWeight: '600', color: colors.dark, marginBottom: '8px', fontFamily: font.family }}>No shops found</h3>
            <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '24px', fontFamily: font.family }}>Try a different search or category</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All') }}
              style={{ backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '12px 28px', fontSize: font.base, fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}