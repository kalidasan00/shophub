'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ShopCard from '@/components/ui/ShopCard'
import ProductCard from '@/components/ui/ProductCard'
import { shopsAPI, productsAPI } from '@/lib/api'
import useCartStore from '@/store/useCartStore'
import {
  Shirt, Laptop, UtensilsCrossed, Sparkles, Dumbbell, BookOpen, Home as HomeIcon, Gamepad2,
  ChevronLeft, ChevronRight, ArrowRight, Store, Star, Zap,
} from 'lucide-react'
import { colors, font, radius } from '@/lib/styles'

const categories = [
  { label: 'Fashion',     Icon: Shirt,           bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', iconColor: '#D97706' },
  { label: 'Electronics', Icon: Laptop,           bg: 'linear-gradient(135deg,#EEF2FF,#C7D2FE)', iconColor: '#6366F1' },
  { label: 'Food',        Icon: UtensilsCrossed,  bg: 'linear-gradient(135deg,#FEE2E2,#FECACA)', iconColor: '#EF4444' },
  { label: 'Beauty',      Icon: Sparkles,         bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', iconColor: '#EC4899' },
  { label: 'Sports',      Icon: Dumbbell,         bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', iconColor: '#10B981' },
  { label: 'Books',       Icon: BookOpen,         bg: 'linear-gradient(135deg,#FEF9C3,#FEF08A)', iconColor: '#CA8A04' },
  { label: 'Home',        Icon: HomeIcon,         bg: 'linear-gradient(135deg,#E0F2FE,#BAE6FD)', iconColor: '#0EA5E9' },
  { label: 'Toys',        Icon: Gamepad2,         bg: 'linear-gradient(135deg,#F3E8FF,#E9D5FF)', iconColor: '#A855F7' },
]

export default function HomePage() {
  const [shops, setShops] = useState<any[]>([])
  const [dealProducts, setDealProducts] = useState<any[]>([])
  const [topRatedProducts, setTopRatedProducts] = useState<any[]>([])
  const [stats, setStats] = useState({ shopCount: 0, productCount: 0 })
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const dealsRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = (product: any) => addItem({ ...product, id: product._id })
  const scrollDeals = (dir: 'left' | 'right') => {
    dealsRef.current?.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' })
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
        setStats({ shopCount: shopsRes.data.total || 0, productCount: topRatedRes.data.total || 0 })
      } catch (err) {
        console.error('Failed to load homepage data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  return (
    <div style={{ fontFamily: font.family, backgroundColor: '#F8F9FF', minHeight: '100vh' }}>
      <style>{`
        .deals-scroll::-webkit-scrollbar { display: none; }
        .deals-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .top-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 768px) {
          .shop-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .top-grid  { grid-template-columns: repeat(4, 1fr); gap: 16px; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(145deg, #6366F1 0%, #8B5CF6 60%, #A78BFA 100%)',
        padding: 'clamp(1.75rem, 5vw, 3rem) 1.25rem clamp(2rem, 6vw, 3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }} className="fade-up">
          {/* pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '4px 12px', marginBottom: '1rem' }}>
            <span style={{ width: '6px', height: '6px', background: '#4ADE80', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>
              {stats.shopCount > 0 ? `${stats.shopCount}+ Shops Live` : 'Shops Now Live'}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '0.65rem' }}>
            Discover Shops,{' '}
            <span style={{ color: '#FDE68A' }}>Find Everything</span>{' '}
            You Need
          </h1>

          <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '360px' }}>
            Hundreds of local and online shops — fashion, electronics, food and more, all in one place.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/shops" style={{
              background: '#fff', color: colors.primary, textDecoration: 'none',
              padding: '10px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}>
              Explore Shops <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <Link href="/seller" style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none',
              padding: '10px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '14px',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
            }}>
              List Your Shop
            </Link>
          </div>
        </div>

        {/* Stats strip inside hero */}
        <div style={{
          maxWidth: '480px', margin: '1.75rem auto 0',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
          borderRadius: '16px', padding: '0.85rem 0.5rem',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          {[
            { value: stats.productCount > 0 ? `${stats.productCount}+` : '—', label: 'Products' },
            { value: stats.shopCount > 0    ? `${stats.shopCount}+`    : '—', label: 'Shops'    },
            { value: '50K+',  label: 'Customers' },
            { value: '4.8★',  label: 'Rating'    },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', fontWeight: 800, color: '#fff', margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: 'clamp(1.25rem, 4vw, 2rem) 1.25rem' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F0F1A', margin: 0 }}>Shop by Category</h2>
            <Link href="/shops" style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
              All <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="cat-grid">
            {categories.map(({ label, Icon, bg, iconColor }) => (
              <Link key={label} href={`/shops?category=${label.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', borderRadius: '14px', padding: '10px 6px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  border: '1px solid #EBEBF5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'transform 0.15s',
                }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={iconColor} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#0F0F1A', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP DEALS ── */}
      {(loading || dealProducts.length > 0) && (
        <section style={{ padding: '0 0 clamp(1.25rem, 4vw, 2rem)' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'linear-gradient(135deg,#FEE2E2,#FECACA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={13} color="#EF4444" strokeWidth={2.5} fill="#EF4444" />
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F0F1A', margin: 0 }}>Top Deals</h2>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => scrollDeals('left')} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #EBEBF5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft size={14} color="#0F0F1A" />
                </button>
                <button onClick={() => scrollDeals('right')} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #EBEBF5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={14} color="#0F0F1A" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', gap: '10px', paddingLeft: '1.25rem', overflowX: 'hidden' }}>
              {[1,2,3].map(i => <div key={i} style={{ minWidth: '150px', height: '210px', borderRadius: '16px', background: '#fff', border: '1px solid #EBEBF5', flexShrink: 0 }} />)}
            </div>
          ) : (
            <div ref={dealsRef} className="deals-scroll" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingLeft: '1.25rem', paddingRight: '1.25rem', scrollSnapType: 'x mandatory' }}>
              {dealProducts.map((product) => (
                <div key={product._id} style={{ minWidth: '150px', maxWidth: '175px', flex: '0 0 auto', scrollSnapAlign: 'start' }}>
                  <ProductCard product={{ ...product, id: product._id }} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── FEATURED SHOPS ── */}
      <section style={{ padding: '0 1.25rem clamp(1.25rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'linear-gradient(135deg,#EEF2FF,#C7D2FE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={13} color="#6366F1" strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F0F1A', margin: 0 }}>Featured Shops</h2>
            </div>
            <Link href="/shops" style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
              All <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>

          {loading ? (
            <div className="shop-grid">
              {[1,2,3,4].map(i => <div key={i} style={{ height: '160px', borderRadius: '16px', background: '#fff', border: '1px solid #EBEBF5' }} />)}
            </div>
          ) : shops.length > 0 ? (
            <div className="shop-grid">
              {shops.slice(0, 4).map((shop) => (
                <ShopCard key={shop._id} shop={{ ...shop, id: shop._id, reviews: shop.numReviews, products: shop.productCount || 0 }} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ── TOP RATED ── */}
      {!loading && topRatedProducts.length > 0 && (
        <section style={{ padding: '0 1.25rem clamp(1.25rem, 4vw, 2rem)' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'linear-gradient(135deg,#FEF9C3,#FEF08A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={13} color="#CA8A04" strokeWidth={2} fill="#CA8A04" />
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F0F1A', margin: 0 }}>Top Rated</h2>
              </div>
              <Link href="/shops" style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                All <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            </div>
            <div className="top-grid">
              {topRatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={{ ...product, id: product._id }} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SELLER CTA ── */}
      <section style={{ padding: '0 1.25rem clamp(2rem, 6vw, 3rem)' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 100%)',
            borderRadius: '20px', padding: 'clamp(1.25rem, 4vw, 2rem)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(99,102,241,0.25)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#A5B4FC', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>For Sellers</p>
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Own a Shop?<br />List it Free.
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Reach thousands of customers. Setup takes less than 5 minutes.
            </p>
            <Link href="/seller" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color: '#fff', textDecoration: 'none',
              padding: '10px 20px', borderRadius: '12px',
              fontWeight: 700, fontSize: '13px',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}>
              Get Started Free <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}