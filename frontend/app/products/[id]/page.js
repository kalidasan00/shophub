'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { productsAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

function Stars({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" style={{ fill: s <= Math.floor(rating) ? '#FBBF24' : '#E5E7EB' }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function Pill({ label, color = colors.primary, bg = colors.primaryLight }) {
  return (
    <span style={{ fontSize: '11px', fontWeight: '600', color, backgroundColor: bg, padding: '3px 9px', borderRadius: radius.full, fontFamily: font.family, letterSpacing: '0.02em' }}>
      {label}
    </span>
  )
}

export default function ProductPage({ params }) {
  const { id } = use(params)

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [activeThumb, setActiveThumb] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await productsAPI.getOne(id)
        const p = res.data.product
        setProduct(p)
        setSelectedSize(p.sizes?.[0] || null)
        setSelectedColor(p.colors?.[0] || null)

        // Fetch related products from same shop
        const shopId = p.shop?._id || p.shopId
        if (shopId) {
          try {
            const relRes = await productsAPI.getByShop(shopId)
            setRelatedProducts(
              (relRes.data.products || [])
                .filter((r) => String(r._id) !== String(id))
                .slice(0, 4)
            )
          } catch (_) {}
        }
      } catch (err) {
        setError('Product not found')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const handleAddToCart = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0.6rem 1rem', fontFamily: font.family }}>
        <div style={{ height: '12px', width: '200px', backgroundColor: colors.surface, borderRadius: '6px', marginBottom: '0.8rem' }} />
        <div style={{ backgroundColor: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '16px', borderRight: `1px solid ${colors.border}` }}>
            <div style={{ aspectRatio: '4/5', backgroundColor: colors.surface, borderRadius: '12px', marginBottom: '10px' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1,2,3].map(i => <div key={i} style={{ flex: 1, aspectRatio: '1', backgroundColor: colors.surface, borderRadius: '8px' }} />)}
            </div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[80, 160, 60, 80, 100, 60].map((w, i) => (
              <div key={i} style={{ height: '14px', width: `${w}%`, backgroundColor: colors.surface, borderRadius: '6px' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', fontFamily: font.family }}>
        <h2 style={{ fontSize: font.xl, fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>Product not found</h2>
        <Link href="/shops" style={{ color: colors.primary, textDecoration: 'none' }}>Back to Shops</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>
      <style>{`
        .pd-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 768px) { .pd-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }
        .related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (min-width: 640px) { .related-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: inherit; }
        .size-btn:hover { border-color: ${colors.primary} !important; }
        .color-btn:hover { border-color: ${colors.primary} !important; }
        .thumb:hover { border-color: ${colors.primary} !important; }
        .related-card:hover .related-name { color: ${colors.primary} !important; }
        .related-card:hover { border-color: ${colors.primary}44 !important; transform: translateY(-2px); }
        .related-card { transition: ${transition.base}; }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: colors.muted, padding: '0.6rem 0 0.8rem' }}>
          <Link href="/" style={{ color: colors.muted, textDecoration: 'none' }}>Home</Link>
          <span style={{ color: colors.border }}>/</span>
          <Link href="/shops" style={{ color: colors.muted, textDecoration: 'none' }}>Shops</Link>
          <span style={{ color: colors.border }}>/</span>
          <Link href={`/shops/${product.shop?._id || product.shopId}`} style={{ color: colors.muted, textDecoration: 'none' }}>{product.shop?.name || product.shopName}</Link>
          <span style={{ color: colors.border }}>/</span>
          <span style={{ color: colors.dark, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="pd-grid" style={{ backgroundColor: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: '12px', boxShadow: shadow.card }}>

          {/* Left — Image */}
          <div style={{ padding: '16px', borderRight: `1px solid ${colors.border}` }}>

            {/* Main image */}
            <div style={{
              aspectRatio: '4/5',
              backgroundColor: '#F5F5F5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(72px, 18vw, 110px)',
              overflow: 'hidden',
              marginBottom: '10px',
            }}>
              {product.images?.[activeThumb] ? (
                <img src={product.images[activeThumb]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
              ) : (
                <span>{product.icon}</span>
              )}
            </div>

            {/* Thumbnails — only show if images exist */}
            {product.images?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {product.images.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    className="thumb"
                    onClick={() => setActiveThumb(i)}
                    style={{
                      width: '60px',
                      height: '60px',
                      flexShrink: 0,
                      borderRadius: '8px',
                      border: `2px solid ${activeThumb === i ? colors.primary : colors.border}`,
                      backgroundColor: '#F5F5F5',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: transition.base,
                      padding: 0,
                    }}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Pills row */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {product.tag && <Pill label={product.tag} />}
              <Pill label={product.category} color={colors.muted} bg={colors.surface} />
              {discount && <Pill label={`-${discount}%`} color="#B91C1C" bg="#FEF2F2" />}
            </div>

            {/* Name */}
            <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: '800', color: colors.dark, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stars rating={product.rating} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: colors.dark }}>{product.rating}</span>
              <span style={{ fontSize: '12px', color: colors.muted }}>({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '800', color: colors.dark }}>${product.price}</span>
              {product.originalPrice && (
                <span style={{ fontSize: '14px', color: colors.muted, textDecoration: 'line-through' }}>${product.originalPrice}</span>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: colors.border }} />

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Color — <span style={{ color: colors.primary, textTransform: 'none', letterSpacing: 0 }}>{selectedColor}</span>
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className="color-btn"
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: radius.sm,
                        fontSize: '12px',
                        fontFamily: font.family,
                        fontWeight: selectedColor === color ? '600' : '400',
                        border: `1.5px solid ${selectedColor === color ? colors.primary : colors.border}`,
                        backgroundColor: selectedColor === color ? colors.primaryLight : colors.white,
                        color: selectedColor === color ? colors.primary : colors.muted,
                        cursor: 'pointer',
                        transition: transition.base,
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Size — <span style={{ color: colors.primary, textTransform: 'none', letterSpacing: 0 }}>{selectedSize}</span>
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className="size-btn"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: '40px',
                        height: '36px',
                        padding: '0 8px',
                        borderRadius: radius.sm,
                        fontSize: '12px',
                        fontFamily: font.family,
                        fontWeight: '600',
                        border: `1.5px solid ${selectedSize === size ? colors.primary : colors.border}`,
                        backgroundColor: selectedSize === size ? colors.primary : colors.white,
                        color: selectedSize === size ? '#fff' : colors.muted,
                        cursor: 'pointer',
                        transition: transition.base,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${colors.border}`, borderRadius: radius.sm, overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: '34px', height: '34px', background: 'none', border: 'none', fontSize: '18px', color: colors.dark, cursor: 'pointer', fontFamily: font.family, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: colors.dark, fontFamily: font.family }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    style={{ width: '34px', height: '34px', background: 'none', border: 'none', fontSize: '18px', color: colors.dark, cursor: 'pointer', fontFamily: font.family, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
                <span style={{ fontSize: '11.5px', color: colors.muted }}>{product.stock} in stock</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: radius.md,
                  fontSize: '13px',
                  fontWeight: '700',
                  fontFamily: font.family,
                  border: 'none',
                  cursor: 'pointer',
                  transition: transition.base,
                  backgroundColor: added ? '#22C55E' : colors.primary,
                  color: '#fff',
                  letterSpacing: '0.01em',
                }}
              >
                {added ? '✓ Added!' : 'Add to cart'}
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: radius.md,
                  fontSize: '13px',
                  fontWeight: '700',
                  fontFamily: font.family,
                  border: `1.5px solid ${colors.border}`,
                  cursor: 'pointer',
                  transition: transition.base,
                  backgroundColor: colors.white,
                  color: colors.dark,
                  letterSpacing: '0.01em',
                }}
              >
                Buy now
              </button>
            </div>

            {/* Shop link */}
            <Link
              href={`/shops/${product.shop?._id || product.shopId}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: colors.muted, textDecoration: 'none', marginTop: '-4px' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Sold by&nbsp;<span style={{ color: colors.primary, fontWeight: '600' }}>{product.shop?.name || product.shopName}</span>
            </Link>
          </div>
        </div>

        {/* Tabs section */}
        <div style={{ backgroundColor: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: '12px', boxShadow: shadow.card }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}` }}>
            {['description', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                className="tab-btn"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '11px 16px',
                  fontSize: '12.5px',
                  fontWeight: activeTab === tab ? '700' : '500',
                  color: activeTab === tab ? colors.primary : colors.muted,
                  borderBottom: `2px solid ${activeTab === tab ? colors.primary : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: transition.base,
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '16px' }}>

            {activeTab === 'description' && (
              <div style={{ maxWidth: '600px' }}>
                <p style={{ fontSize: '13px', color: colors.muted, lineHeight: '1.7', margin: '0 0 12px' }}>{product.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['Premium quality materials', 'Free shipping over $50', '30-day easy returns', '1 year warranty'].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: colors.muted }}>
                      <svg width="14" height="14" fill="none" stroke="#22C55E" viewBox="0 0 24 24" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px' }}>
                {[
                  { name: 'Sarah M.', rating: 5, comment: 'Absolutely love this! Great quality and fast delivery.', date: '2 days ago' },
                  { name: 'James K.', rating: 4, comment: 'Really good quality. Fits perfectly and looks great.', date: '1 week ago' },
                  { name: 'Priya S.', rating: 5, comment: 'Exceeded my expectations. Will definitely buy again!', date: '2 weeks ago' },
                ].map((review) => (
                  <div key={review.name} style={{ backgroundColor: colors.surface, borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: colors.primary }}>
                          {review.name[0]}
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: colors.dark }}>{review.name}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: colors.muted }}>{review.date}</span>
                    </div>
                    <Stars rating={review.rating} size={12} />
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: colors.muted, lineHeight: '1.5' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', maxWidth: '600px' }}>
                {[
                  { icon: '🚀', title: 'Express', desc: '1–2 days · $9.99' },
                  { icon: '📦', title: 'Standard', desc: '3–5 days · Free over $50' },
                  { icon: '🔄', title: 'Returns', desc: '30-day hassle-free' },
                  { icon: '🌍', title: 'International', desc: '7–14 days · rates vary' },
                ].map((item) => (
                  <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: colors.surface, borderRadius: '10px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '700', color: colors.dark }}>{item.title}</p>
                      <p style={{ margin: 0, fontSize: '11.5px', color: colors.muted }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div style={{ paddingBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: '700', color: colors.dark, margin: '0 0 10px' }}>
              You may also like
            </h2>
            <div className="related-grid">
              {relatedProducts.map((p) => (
                <Link
                  key={p._id}
                  href={`/products/${p._id}`}
                  className="related-card"
                  style={{ textDecoration: 'none', backgroundColor: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden', display: 'block', boxShadow: shadow.card }}
                >
                  <div style={{ aspectRatio: '4/5', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', overflow: 'hidden' }}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                      : <span>{p.icon}</span>
                    }
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p className="related-name" style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '600', color: colors.dark, transition: transition.base, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: colors.dark }}>${p.price}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" style={{ fill: '#FBBF24' }}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span style={{ fontSize: '11px', color: colors.muted }}>{p.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}