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
      <style>{`
        .shops-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .shops-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .shops-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) 1.25rem clamp(0.875rem, 2vw, 1.5rem)' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', color: colors.primary, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Marketplace
          </span>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2.5rem)', fontWeight: '800', color: colors.dark, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            All Shops
          </h1>
          <p style={{ fontSize: '13px', color: colors.muted, lineHeight: '1.5', marginBottom: '0.875rem' }}>
            Browse shops across all categories
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '520px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search shops, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '9px 12px 9px 38px', fontSize: '13px', fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(0.875rem, 2vw, 2.5rem) 1.25rem' }}>

        {/* Filters Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: '5px 11px', borderRadius: radius.full, fontSize: '12px', fontWeight: '500', fontFamily: font.family, cursor: 'pointer', border: `1px solid ${activeCategory === cat ? colors.primary : colors.border}`, backgroundColor: activeCategory === cat ? colors.primary : colors.white, color: activeCategory === cat ? colors.white : '#4B5563', transition: 'all 0.2s ease', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {cat}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '6px 10px', fontSize: '12px', fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, cursor: 'pointer', minWidth: '110px', flexShrink: 0 }}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <p style={{ fontSize: '12px', color: colors.muted, fontFamily: font.family, marginBottom: '0.75rem' }}>
          Showing <span style={{ fontWeight: '600', color: colors.dark }}>{shops.length}</span> shops
          {activeCategory !== 'All' && <span> in <span style={{ fontWeight: '600', color: colors.primary }}>{activeCategory}</span></span>}
        </p>

        {/* Loading */}
        {loading ? (
          <div className="shops-grid">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ backgroundColor: colors.white, borderRadius: '14px', border: `1px solid ${colors.border}`, padding: 'clamp(10px, 2.5vw, 18px)', height: 'clamp(130px, 26vw, 170px)', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: 'clamp(36px, 8vw, 48px)', height: 'clamp(36px, 8vw, 48px)', backgroundColor: colors.surface, borderRadius: '10px', marginBottom: '10px' }} />
                <div style={{ width: '70%', height: '12px', backgroundColor: colors.surface, borderRadius: '6px', marginBottom: '6px' }} />
                <div style={{ width: '45%', height: '9px', backgroundColor: colors.surface, borderRadius: '6px' }} />
              </div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="shops-grid">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={{ ...shop, id: shop._id, reviews: shop.numReviews, products: shop.productCount || 0 }} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'clamp(3rem, 8vw, 6rem) 1rem' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: font.lg, fontWeight: '600', color: colors.dark, marginBottom: '6px', fontFamily: font.family }}>No shops found</h3>
            <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '20px', fontFamily: font.family }}>Try a different search or category</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All') }}
              style={{ backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '10px 24px', fontSize: '14px', fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}