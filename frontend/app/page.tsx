'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ShopCard from '@/components/ui/ShopCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { colors, font, radius } from '@/lib/styles'

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

const stats = [
  { value: '10,000+', label: 'Products' },
  { value: '500+', label: 'Shops' },
  { value: '50,000+', label: 'Customers' },
  { value: '4.8★', label: 'Avg Rating' },
]

export default function HomePage() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/shops?limit=6&sort=rating')
        const data = await res.json()
        setShops(data.shops || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  return (
    <div style={{ fontFamily: font.family }}>

      {/* Hero */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(3rem, 8vw, 6rem) 1.5rem clamp(2rem, 5vw, 4rem)' }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: colors.primaryLight, color: colors.primary, fontSize: font.xs, fontWeight: '700', padding: '6px 14px', borderRadius: radius.full, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: colors.primary, borderRadius: '50%', display: 'inline-block' }} />
            500+ Shops Now Live
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: '800', color: colors.dark, lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Discover Shops,{' '}
            <span style={{ color: colors.primary }}>Find Everything</span>{' '}
            You Need
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: colors.muted, lineHeight: '1.7', marginBottom: '2rem', maxWidth: '520px' }}>
            Browse hundreds of local and online shops across all categories.
            From fashion to electronics, food to books — it's all here.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/shops"
              style={{ backgroundColor: colors.primary, color: 'white', textDecoration: 'none', padding: '14px 32px', borderRadius: radius.lg, fontWeight: '700', fontSize: font.md, transition: 'all 0.2s', display: 'inline-block' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}>
              Explore Shops
            </Link>
            <Link href="/auth/register"
              style={{ backgroundColor: colors.white, color: colors.dark, textDecoration: 'none', padding: '14px 32px', borderRadius: radius.lg, fontWeight: '500', fontSize: font.md, border: `1px solid ${colors.border}`, transition: 'all 0.2s', display: 'inline-block' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.color = colors.primary }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.dark }}>
              List Your Shop
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.white }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '0.5rem' }}>
              <p style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '800', color: colors.dark, marginBottom: '4px' }}>{stat.value}</p>
              <p style={{ fontSize: font.sm, color: colors.muted }}>{stat.label}</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/shops?category=${cat.label.toLowerCase()}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: 'clamp(12px, 3vw, 20px) 8px', borderRadius: '16px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: 'clamp(40px, 8vw, 52px)', height: 'clamp(40px, 8vw, 52px)', borderRadius: '12px', backgroundColor: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(20px, 4vw, 26px)' }}>
                {cat.icon}
              </div>
              <span style={{ fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: '500', color: colors.dark, textAlign: 'center' }}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Shops */}
      <section style={{ backgroundColor: colors.surface, padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionHeader
            title="Featured Shops"
            subtitle="Handpicked top-rated shops for you"
            linkLabel="View all"
            linkHref="/shops"
          />

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', height: '280px' }}>
                  <div style={{ height: '140px', backgroundColor: colors.surface }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ width: '60%', height: '16px', backgroundColor: colors.surface, borderRadius: '8px', marginBottom: '8px' }} />
                    <div style={{ width: '40%', height: '12px', backgroundColor: colors.surface, borderRadius: '8px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {shops.map((shop) => (
                <ShopCard
                  key={shop._id}
                  shop={{ ...shop, id: shop._id, reviews: shop.numReviews, products: shop.productCount || 0 }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

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

      {/* CTA */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem clamp(3rem, 6vw, 5rem)' }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, borderRadius: '24px', padding: 'clamp(2rem, 5vw, 4rem)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Own a Shop? List it Free.
          </h2>
          <p style={{ fontSize: font.md, color: '#C7D2FE', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Reach thousands of customers by listing your shop on ShopHub today. Setup takes less than 5 minutes.
          </p>
          <Link href="/auth/register"
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