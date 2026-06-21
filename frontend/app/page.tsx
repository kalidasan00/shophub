'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ShopCard from '@/components/ui/ShopCard'
import ProductCard from '@/components/ui/ProductCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { colors, font, radius } from '@/lib/styles'
import { shopsAPI, productsAPI } from '@/lib/api'
import useCartStore from '@/store/useCartStore'
import {
  Shirt, Laptop, UtensilsCrossed, Sparkles, Dumbbell, BookOpen, Home as HomeIcon, Gamepad2,
  Search, ShoppingBag, Truck, Flame, ChevronLeft, ChevronRight,
} from 'lucide-react'

const categories = [
  { label: 'Fashion', Icon: Shirt, color: '#FEF3C7' },
  { label: 'Electronics', Icon: Laptop, color: '#EEF2FF' },
  { label: 'Food', Icon: UtensilsCrossed, color: '#FEE2E2' },
  { label: 'Beauty', Icon: Sparkles, color: '#FCE7F3' },
  { label: 'Sports', Icon: Dumbbell, color: '#D1FAE5' },
  { label: 'Books', Icon: BookOpen, color: '#FEF9C3' },
  { label: 'Home', Icon: HomeIcon, color: '#E0F2FE' },
  { label: 'Toys', Icon: Gamepad2, color: '#F3E8FF' },
]

export default function HomePage() {
  const [shops, setShops] = useState<any[]>([])
  const [dealProducts, setDealProducts] = useState<any[]>([])
  const [topRatedProducts, setTopRatedProducts] = useState<any[]>([])
  const [stats, setStats] = useState({ shopCount: 0, productCount: 0 })
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const dealsScrollRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = (product: any) => {
    addItem({ ...product, id: product._id })
  }

  const scrollDeals = (direction: 'left' | 'right') => {
    if (!dealsScrollRef.current) return
    const scrollAmount = 240
    dealsScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [shopsRes, dealsRes, topRatedRes] = await Promise.all([
          shopsAPI.getAll({ limit: 4, sort: 'rating' }),
          productsAPI.getAll({ tag: 'Sale', limit: 10 }),
          productsAPI.getAll({ sort: 'rating', limit: 4 }),
        ])

        setShops(shopsRes.data.shops || [])
        setDealProducts(dealsRes.data.products || [])
        setTopRatedProducts(topRatedRes.data.products || [])
        setStats({
          shopCount: shopsRes.data.total || 0,
          productCount: topRatedRes.data.total || 0,
        })
      } catch (err) {
        console.error('Failed to load homepage data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  const statsDisplay = [
    { value: stats.productCount > 0 ? `${stats.productCount}+` : '—', label: 'Products' },
    { value: stats.shopCount > 0 ? `${stats.shopCount}+` : '—', label: 'Shops' },
    { value: '50,000+', label: 'Customers' },
    { value: '4.8★', label: 'Avg Rating' },
  ]

  return (
    <div style={{ fontFamily: font.family }}>
      <style>{`
        .deals-scroll::-webkit-scrollbar { display: none; }
        .deals-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .grid-2x2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 768px) {
          .grid-2x2 { gap: 20px; }
        }
      `}</style>

      {/* Hero */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) 1.5rem clamp(1.25rem, 3vw, 2rem)' }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: colors.primaryLight, color: colors.primary, fontSize: font.xs, fontWeight: '700', padding: '5px 12px', borderRadius: radius.full, marginBottom: '1rem', letterSpacing: '0.05em' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: colors.primary, borderRadius: '50%', display: 'inline-block' }} />
            {stats.shopCount > 0 ? `${stats.shopCount}+ Shops Now Live` : 'Shops Now Live'}
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 4.5vw, 3rem)', fontWeight: '800', color: colors.dark, lineHeight: '1.15', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Discover Shops,{' '}
            <span style={{ color: colors.primary }}>Find Everything</span>{' '}
            You Need
          </h1>

          <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.05rem)', color: colors.muted, lineHeight: '1.6', marginBottom: '1.25rem', maxWidth: '520px' }}>
            Browse hundreds of local and online shops across all categories.
            From fashion to electronics, food to books — it's all here.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/shops"
              style={{ backgroundColor: colors.primary, color: 'white', textDecoration: 'none', padding: '10px 24px', borderRadius: radius.lg, fontWeight: '700', fontSize: font.base, transition: 'all 0.2s', display: 'inline-block' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}>
              Explore Shops
            </Link>
            <Link href="/seller"
              style={{ backgroundColor: colors.white, color: colors.dark, textDecoration: 'none', padding: '10px 24px', borderRadius: radius.lg, fontWeight: '500', fontSize: font.base, border: `1px solid ${colors.border}`, transition: 'all 0.2s', display: 'inline-block' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.color = colors.primary }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.dark }}>
              List Your Shop
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.white }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {statsDisplay.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '0.25rem' }}>
              <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', fontWeight: '800', color: colors.dark, marginBottom: '2px' }}>{stat.value}</p>
              <p style={{ fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)', color: colors.muted }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem' }}>
        <SectionHeader
          title="Shop by Category"
          subtitle="Find exactly what you're looking for"
          linkLabel="View all"
          linkHref="/shops"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {categories.map(({ label, Icon, color }) => (
            <Link
              key={label}
              href={`/shops?category=${label.toLowerCase()}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: 'clamp(8px, 2vw, 16px) 4px', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: 'clamp(32px, 7vw, 48px)', height: 'clamp(32px, 7vw, 48px)', borderRadius: '10px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={colors.dark} strokeWidth={1.75} />
              </div>
              <span style={{ fontSize: 'clamp(9px, 1.8vw, 12px)', fontWeight: '500', color: colors.dark, textAlign: 'center' }}>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Deals — horizontal side-scroll, hidden if empty */}
      {loading ? (
        <DealsLoadingSkeleton />
      ) : (
        dealProducts.length > 0 && (
          <section style={{ backgroundColor: '#FEF2F2', padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={20} color="#EF4444" strokeWidth={2} />
                  <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: '700', color: colors.dark, fontFamily: font.family, margin: 0 }}>
                    Top Deals
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => scrollDeals('left')} aria-label="Scroll left"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${colors.border}`, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={16} color={colors.dark} />
                  </button>
                  <button onClick={() => scrollDeals('right')} aria-label="Scroll right"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${colors.border}`, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={16} color={colors.dark} />
                  </button>
                </div>
              </div>

              <div
                ref={dealsScrollRef}
                className="deals-scroll"
                style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px', scrollSnapType: 'x mandatory' }}
              >
                {dealProducts.map((product) => (
                  <div key={product._id} style={{ minWidth: '160px', maxWidth: '200px', flex: '0 0 auto', scrollSnapAlign: 'start' }}>
                    <ProductCard
                      product={{ ...product, id: product._id }}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* Featured Shops — 2x2 grid, hidden if empty */}
      {!loading && shops.length > 0 && (
        <section style={{ backgroundColor: colors.surface, padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
            <SectionHeader
              title="Featured Shops"
              subtitle="Handpicked top-rated shops for you"
              linkLabel="View all"
              linkHref="/shops"
            />
            <div className="grid-2x2">
              {shops.slice(0, 4).map((shop) => (
                <ShopCard
                  key={shop._id}
                  shop={{ ...shop, id: shop._id, reviews: shop.numReviews, products: shop.productCount || 0 }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading && <FeaturedShopsLoadingSkeleton />}

      {/* Top Rated Products — 2x2 grid, hidden if empty */}
      {!loading && topRatedProducts.length > 0 && (
        <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem' }}>
          <SectionHeader
            title="Top Rated Products"
            subtitle="Loved by customers across all shops"
            linkLabel="View all"
            linkHref="/shops"
          />
          <div className="grid-2x2">
            {topRatedProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={{ ...product, id: product._id }}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem' }}>
        <SectionHeader
          title="How ShopHub Works"
          subtitle="Get started in 3 simple steps"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { step: '01', Icon: Search, title: 'Browse Shops', desc: 'Explore hundreds of shops across all categories from one place.' },
            { step: '02', Icon: ShoppingBag, title: 'Pick Products', desc: 'Add your favorite products to cart with one click.' },
            { step: '03', Icon: Truck, title: 'Fast Delivery', desc: 'Get your orders delivered quickly and safely to your door.' },
          ].map(({ step, Icon, title, desc }) => (
            <div key={step} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '2.5rem', fontWeight: '800', color: colors.border, lineHeight: 1 }}>{step}</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={24} color={colors.primary} strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: font.lg, fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: font.base, color: colors.muted, lineHeight: '1.6' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem clamp(2.5rem, 6vw, 4rem)' }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, borderRadius: '24px', padding: 'clamp(1.75rem, 5vw, 3.5rem)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.25rem)', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Own a Shop? List it Free.
          </h2>
          <p style={{ fontSize: font.md, color: '#C7D2FE', marginBottom: '1.75rem', maxWidth: '400px', margin: '0 auto 1.75rem' }}>
            Reach thousands of customers by listing your shop on ShopHub today. Setup takes less than 5 minutes.
          </p>
          <Link href="/seller"
            style={{ display: 'inline-block', backgroundColor: 'white', color: colors.primary, fontWeight: '700', fontSize: font.md, padding: '12px 32px', borderRadius: radius.lg, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryLight}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
            Get Started Free →
          </Link>
        </div>
      </section>

    </div>
  )
}

function DealsLoadingSkeleton() {
  return (
    <section style={{ backgroundColor: '#FEF2F2', padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ width: '140px', height: '22px', backgroundColor: colors.white, borderRadius: '8px', marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '14px', overflowX: 'hidden' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ minWidth: '160px', backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', height: '230px', flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedShopsLoadingSkeleton() {
  return (
    <section style={{ backgroundColor: colors.surface, padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ width: '160px', height: '22px', backgroundColor: colors.white, borderRadius: '8px', marginBottom: '1rem' }} />
        <div className="grid-2x2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', height: '220px' }}>
              <div style={{ height: '110px', backgroundColor: colors.surface }} />
              <div style={{ padding: '14px' }}>
                <div style={{ width: '60%', height: '14px', backgroundColor: colors.surface, borderRadius: '6px', marginBottom: '6px' }} />
                <div style={{ width: '40%', height: '10px', backgroundColor: colors.surface, borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}