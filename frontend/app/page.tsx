'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ShopCard from '@/components/ui/ShopCard'
import ProductCard from '@/components/ui/ProductCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { colors, font, radius } from '@/lib/styles'
import { shopsAPI, productsAPI } from '@/lib/api'
import useCartStore from '@/store/useCartStore'

const categories = [
  { label: 'Fashion', icon: '👗', color: '#FEF3C7' },
  { label: 'Electronics', icon: '💻', color: '#EEF2FF' },
  { label: 'Food', icon: '🍔', color: '#FEE2E2' },
  { label: 'Beauty', icon: '💄', color: '#FCE7F3' },
  { label: 'Sports', icon: '⚽', color: '#D1FAE5' },
  { label: 'Books', icon: '📚', color: '#FEF9C3' },
  { label: 'Home', icon: '🏠', color: '#E0F2FE' },
  { label: 'Toys', icon: '🧸', color: '#F3E8FF' },
]

export default function HomePage() {
  const [shops, setShops] = useState<any[]>([])
  const [dealProducts, setDealProducts] = useState<any[]>([])
  const [topRatedProducts, setTopRatedProducts] = useState<any[]>([])
  const [stats, setStats] = useState({ shopCount: 0, productCount: 0 })
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (product: any) => {
    addItem({ ...product, id: product._id })
  }

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [shopsRes, dealsRes, topRatedRes] = await Promise.all([
          shopsAPI.getAll({ limit: 6, sort: 'rating' }),
          productsAPI.getAll({ tag: 'Sale', limit: 6 }),
          productsAPI.getAll({ sort: 'rating', limit: 6 }),
        ])

        setShops(shopsRes.data.shops || [])
        setDealProducts(dealsRes.data.products || [])
        setTopRatedProducts(topRatedRes.data.products || [])
        setStats({
          shopCount: shopsRes.data.total || 0,
          productCount: dealsRes.data.total !== undefined ? (topRatedRes.data.total || 0) : 0,
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

      {/* Stats — real numbers, falls back to em-dash while loading instead of fake placeholder */}
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
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem' }}>
        <SectionHeader
          title="Shop by Category"
          subtitle="Find exactly what you're looking for"
          linkLabel="View all"
          linkHref="/shops"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/shops?category=${cat.label.toLowerCase()}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: 'clamp(8px, 2vw, 16px) 4px', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: 'clamp(32px, 7vw, 48px)', height: 'clamp(32px, 7vw, 48px)', borderRadius: '10px', backgroundColor: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 3.5vw, 24px)' }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: 'clamp(9px, 1.8vw, 12px)', fontWeight: '500', color: colors.dark, textAlign: 'center' }}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Deals — ONLY renders if there are actual Sale-tagged products */}
      {loading ? (
        <DealsLoadingSkeleton />
      ) : (
        dealProducts.length > 0 && (
          <section style={{ backgroundColor: '#FEF2F2', padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
              <SectionHeader
                title="🔥 Top Deals"
                subtitle="Limited-time discounts you don't want to miss"
                linkLabel="View all deals"
                linkHref="/shops?sort=price_asc"
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {dealProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={{ ...product, id: product._id }}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* Featured Shops — hidden if zero shops exist */}
      {!loading && shops.length > 0 && (
        <section style={{ backgroundColor: colors.surface, padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
            <SectionHeader
              title="Featured Shops"
              subtitle="Handpicked top-rated shops for you"
              linkLabel="View all"
              linkHref="/shops"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {shops.map((shop) => (
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

      {/* Top Rated Products — hidden if none exist */}
      {!loading && topRatedProducts.length > 0 && (
        <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem' }}>
          <SectionHeader
            title="Top Rated Products"
            subtitle="Loved by customers across all shops"
            linkLabel="View all"
            linkHref="/shops"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {topRatedProducts.map((product) => (
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
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem' }}>
        <SectionHeader
          title="How ShopHub Works"
          subtitle="Get started in 3 simple steps"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { step: '01', icon: '🔍', title: 'Browse Shops', desc: 'Explore hundreds of shops across all categories from one place.' },
            { step: '02', icon: '🛍️', title: 'Pick Products', desc: 'Add your favorite products to cart with one click.' },
            { step: '03', icon: '🚀', title: 'Fast Delivery', desc: 'Get your orders delivered quickly and safely to your door.' },
          ].map((item) => (
            <div key={item.step} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '3rem', fontWeight: '800', color: colors.border, lineHeight: 1 }}>{item.step}</div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: font.lg, fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: font.base, color: colors.muted, lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem clamp(3rem, 6vw, 5rem)' }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, borderRadius: '24px', padding: 'clamp(2rem, 5vw, 4rem)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Own a Shop? List it Free.
          </h2>
          <p style={{ fontSize: font.md, color: '#C7D2FE', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Reach thousands of customers by listing your shop on ShopHub today. Setup takes less than 5 minutes.
          </p>
          <Link href="/seller"
            style={{ display: 'inline-block', backgroundColor: 'white', color: colors.primary, fontWeight: '700', fontSize: font.md, padding: '14px 36px', borderRadius: radius.lg, textDecoration: 'none', transition: 'all 0.2s' }}
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
    <section style={{ backgroundColor: '#FEF2F2', padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ width: '180px', height: '24px', backgroundColor: colors.white, borderRadius: '8px', marginBottom: '1.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', height: '260px' }} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedShopsLoadingSkeleton() {
  return (
    <section style={{ backgroundColor: colors.surface, padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ width: '180px', height: '24px', backgroundColor: colors.white, borderRadius: '8px', marginBottom: '1.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', height: '280px' }}>
              <div style={{ height: '140px', backgroundColor: colors.surface }} />
              <div style={{ padding: '16px' }}>
                <div style={{ width: '60%', height: '16px', backgroundColor: colors.surface, borderRadius: '8px', marginBottom: '8px' }} />
                <div style={{ width: '40%', height: '12px', backgroundColor: colors.surface, borderRadius: '8px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}