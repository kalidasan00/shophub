'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ShopCard from '@/components/ui/ShopCard'
import { shopsAPI } from '@/lib/api'
import { colors, font, radius } from '@/lib/styles'

const categories = ['All', 'Fashion', 'Electronics', 'Food', 'Beauty', 'Sports', 'Books', 'Home', 'Toys']
const sortOptions = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
  { label: 'Name A-Z', value: 'name' },
]

export default function ShopsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Search stays owned by the navbar — this page just reads whatever it set in the URL.
  const search = searchParams.get('search') || ''

  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('rating')

  // Mobile filter sheet — draft values so edits only apply on "Apply"
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draftCategory, setDraftCategory] = useState(activeCategory)
  const [draftSort, setDraftSort] = useState(sortBy)

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

  const openSheet = () => {
    setDraftCategory(activeCategory)
    setDraftSort(sortBy)
    setSheetOpen(true)
  }

  const applySheet = () => {
    setActiveCategory(draftCategory)
    setSortBy(draftSort)
    setSheetOpen(false)
  }

  const resetSheet = () => {
    setDraftCategory('All')
    setDraftSort('rating')
  }

  const clearFilters = () => {
    setActiveCategory('All')
    setSortBy('rating')
    if (search) router.push(pathname)
  }

  const activeFilterCount = (activeCategory !== 'All' ? 1 : 0) + (sortBy !== 'rating' ? 1 : 0)

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
        .filters-desktop { display: none; }
        .filters-mobile-trigger { display: flex; }
        @media (min-width: 640px) {
          .filters-desktop { display: flex; }
          .filters-mobile-trigger { display: none; }
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {/* Page Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) 1.25rem clamp(0.875rem, 2vw, 1.5rem)' }}>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2.5rem)', fontWeight: '800', color: colors.dark, letterSpacing: '-0.02em' }}>
            All Shops
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(0.875rem, 2vw, 2.5rem) 1.25rem' }}>

        {/* Desktop filters row (sm and up) */}
        <div className="filters-desktop" style={{ flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
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

        {/* Mobile filter trigger (below sm) */}
        <div className="filters-mobile-trigger" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', flex: 1 }}>
            {categories.slice(0, 5).map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: '5px 11px', borderRadius: radius.full, fontSize: '12px', fontWeight: '500', fontFamily: font.family, cursor: 'pointer', border: `1px solid ${activeCategory === cat ? colors.primary : colors.border}`, backgroundColor: activeCategory === cat ? colors.primary : colors.white, color: activeCategory === cat ? colors.white : '#4B5563', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={openSheet}
            aria-label="Open filters"
            style={{ position: 'relative', marginLeft: '8px', flexShrink: 0, width: '34px', height: '34px', borderRadius: radius.md, border: `1px solid ${colors.border}`, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="16" height="16" fill="none" stroke="#4B5563" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            {activeFilterCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colors.primary, color: colors.white, fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
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
            <button onClick={clearFilters}
              style={{ backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '10px 24px', fontSize: '14px', fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter bottom sheet */}
      {sheetOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            onClick={() => setSheetOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopLeftRadius: '16px', borderTopRightRadius: '16px', maxHeight: '85vh', overflowY: 'auto', animation: 'slideUp 0.2s ease-out' }}>
            <div style={{ position: 'sticky', top: 0, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: colors.dark, fontFamily: font.family }}>Filters</span>
              <button onClick={() => setSheetOpen(false)} aria-label="Close filters" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="18" height="18" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: colors.dark, marginBottom: '8px', fontFamily: font.family }}>Category</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setDraftCategory(cat)}
                    style={{ padding: '6px 12px', borderRadius: radius.full, fontSize: '12px', fontWeight: '500', fontFamily: font.family, cursor: 'pointer', border: `1px solid ${draftCategory === cat ? colors.primary : colors.border}`, backgroundColor: draftCategory === cat ? colors.primary : colors.white, color: draftCategory === cat ? colors.white : '#4B5563' }}>
                    {cat}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '13px', fontWeight: '600', color: colors.dark, marginBottom: '8px', fontFamily: font.family }}>Sort by</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
                {sortOptions.map((opt) => (
                  <button key={opt.value} onClick={() => setDraftSort(opt.value)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', color: colors.dark, fontFamily: font.family }}>{opt.label}</span>
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: `1px solid ${draftSort === opt.value ? colors.primary : colors.border}`,
                      backgroundColor: draftSort === opt.value ? colors.primary : colors.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {draftSort === opt.value && (
                        <svg width="10" height="10" fill="none" stroke={colors.white} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ position: 'sticky', bottom: 0, backgroundColor: colors.white, borderTop: `1px solid ${colors.border}`, padding: '12px 16px', display: 'flex', gap: '10px' }}>
              <button onClick={resetSheet}
                style={{ flex: 1, height: '42px', borderRadius: radius.md, border: `1px solid ${colors.border}`, backgroundColor: colors.white, color: colors.dark, fontSize: '13px', fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
                Reset
              </button>
              <button onClick={applySheet}
                style={{ flex: 1, height: '42px', borderRadius: radius.md, border: 'none', backgroundColor: colors.primary, color: colors.white, fontSize: '13px', fontWeight: '600', fontFamily: font.family, cursor: 'pointer' }}>
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}