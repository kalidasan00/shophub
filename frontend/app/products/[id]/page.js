'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { use } from 'react'
import { productsAPI } from '@/lib/api'
import useCartStore from '@/store/useCartStore'
import useAuthStore from '@/store/useAuthStore'
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
    <span style={{ fontSize: '10.5px', fontWeight: '600', color, backgroundColor: bg, padding: '3px 8px', borderRadius: radius.full, fontFamily: font.family, letterSpacing: '0.02em' }}>
      {label}
    </span>
  )
}

function ReviewForm({ productId, onSubmitted }) {
  const user = useAuthStore((state) => state.user)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!user) {
    return (
      <div style={{ backgroundColor: colors.surface, borderRadius: '10px', padding: '14px', textAlign: 'center', marginBottom: '10px' }}>
        <p style={{ fontSize: '12.5px', color: colors.muted, margin: 0 }}>
          <Link href={`/auth/login?redirect=/products/${productId}`} style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>
            Log in
          </Link>{' '}
          to write a review.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating'); return }
    if (!comment.trim()) { setError('Please write a comment'); return }
    setError(null)
    setSubmitting(true)
    try {
      await productsAPI.addReview(productId, { rating, comment: comment.trim() })
      onSubmitted({ _id: `temp-${Date.now()}`, name: user.name, rating, comment: comment.trim(), createdAt: new Date().toISOString() })
      setRating(0)
      setComment('')
    } catch (err) {
      // Backend returns 400 "Already reviewed" if this user already left
      // one — surface that directly instead of a generic failure.
      setError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '12.5px', fontWeight: 700, color: colors.dark }}>Write a review</p>

      <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setRating(s); setError(null) }}
            onMouseEnter={() => setHoverRating(s)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: s <= (hoverRating || rating) ? '#FBBF24' : '#E5E7EB', transition: transition.base }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => { setComment(e.target.value); setError(null) }}
        placeholder="Share your thoughts on this product..."
        rows={3}
        style={{
          width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.sm,
          padding: '9px 11px', fontSize: '12.5px', fontFamily: font.family,
          outline: 'none', color: colors.dark, resize: 'vertical', boxSizing: 'border-box',
          marginBottom: '10px',
        }}
        onFocus={(e) => e.target.style.borderColor = colors.primary}
        onBlur={(e) => e.target.style.borderColor = colors.border}
      />

      {error && (
        <p style={{ fontSize: '11.5px', color: '#EF4444', margin: '0 0 10px' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '9px 18px', borderRadius: radius.md, border: 'none',
          backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: '#fff',
          fontSize: '12.5px', fontWeight: 700, fontFamily: font.family,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

export default function ProductPage({ params }) {
  const { id } = use(params)
  const addItem = useCartStore((state) => state.addItem)

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
    let cancelled = false
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await productsAPI.getOne(id)
        if (cancelled) return
        const p = res.data.product
        setProduct(p)
        setSelectedSize(p.sizes?.[0] || null)
        setSelectedColor(p.colors?.[0] || null)

        const shopId = p.shop?._id || p.shopId
        if (shopId) {
          try {
            const relRes = await productsAPI.getByShop(shopId)
            if (cancelled) return
            setRelatedProducts(
              (relRes.data.products || [])
                .filter((r) => String(r._id) !== String(id))
                .slice(0, 4)
            )
          } catch (_) {}
        }
      } catch (err) {
        if (!cancelled) setError('Product not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [id])

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  // Fix: this used to only flash a "✓ Added!" animation without ever
  // touching the cart — customers who clicked it walked away with an
  // empty cart, no error, no indication anything was wrong. Now it
  // actually adds the product (with the selected size/color/quantity)
  // to the real cart store.
  const handleAddToCart = () => {
    addItem(
      { ...product, id: product._id, selectedSize, selectedColor },
      quantity
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // New: called after a review is successfully submitted. Updates the
  // product in local state immediately (new review appended, rating/
  // numReviews recalculated) so the UI reflects it instantly instead of
  // requiring a full page refresh — the actual source of truth is still
  // the backend, this is just an optimistic local mirror of it.
  const handleReviewSubmitted = (newReview) => {
    setProduct((prev) => {
      const reviews = [newReview, ...(prev.reviews || [])]
      const numReviews = reviews.length
      const rating = reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      return { ...prev, reviews, numReviews, rating }
    })
  }

  // Fix: previously had no onClick at all — a completely dead button.
  // Adds to cart the same way, then sends the customer straight to
  // checkout instead of leaving them to find the cart themselves.
  const handleBuyNow = () => {
    addItem(
      { ...product, id: product._id, selectedSize, selectedColor },
      quantity
    )
    window.location.href = '/checkout'
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
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family, paddingBottom: '96px' }}>
      <style>{`
        .pd-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 768px) { .pd-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } }

        .pd-media-col { padding: 0; border-right: none; }
        @media (min-width: 768px) { .pd-media-col { padding: 16px; border-right: 1px solid ${colors.border}; } }

        /* Fix: this was a full 1:1 square at 100% viewport width, which
           on a typical phone (e.g. 390px wide) meant a ~390px-tall image
           before any product info was visible at all — a lot of empty
           scroll before the "important" content. Capping the height
           keeps it visually prominent without dominating the whole
           first screen. */
        .pd-main-image { aspect-ratio: 1 / 1; border-radius: 0; max-height: 62vh; }
        @media (min-width: 768px) { .pd-main-image { aspect-ratio: 4 / 5; border-radius: 12px; max-height: none; } }

        .pd-dots { display: flex; justify-content: center; align-items: center; gap: 5px; padding: 8px 0 2px; }
        @media (min-width: 768px) { .pd-dots { display: none; } }
        .pd-dot { width: 6px; height: 6px; border-radius: 3px; border: none; padding: 0; cursor: pointer; background: ${colors.border}; transition: ${transition.base}; }
        .pd-dot.active { width: 16px; background: ${colors.primary}; }

        .pd-thumbs { display: none; }
        @media (min-width: 768px) { .pd-thumbs { display: flex; gap: 6px; margin-top: 10px; padding: 0 0; } }

        /* Fix: tightened mobile padding/gap slightly — the info block
           felt loose relative to how little vertical space a phone has. */
        .pd-info-col { padding: 10px 14px 12px; gap: 8px; }
        @media (min-width: 768px) { .pd-info-col { padding: 16px; gap: 14px; } }

        .pd-cta-inline { display: none; }
        @media (min-width: 768px) { .pd-cta-inline { display: flex; } }
        .pd-cta-sticky { position: fixed; bottom: 64px; left: 0; right: 0; z-index: 20; background: ${colors.white}; border-top: 1px solid ${colors.border}; box-shadow: ${shadow.card}; padding: 8px 14px; display: flex; }
        @media (min-width: 768px) { .pd-cta-sticky { display: none; } }

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
        <nav style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: colors.muted, padding: '0.6rem 0 0.6rem' }}>
          <Link href="/" style={{ color: colors.muted, textDecoration: 'none' }}>Home</Link>
          <span style={{ color: colors.border }}> / </span>
          <Link href="/shops" style={{ color: colors.muted, textDecoration: 'none' }}>Shops</Link>
          <span style={{ color: colors.border }}> / </span>
          <span style={{ color: colors.dark, fontWeight: '500' }}>{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="pd-grid" style={{ backgroundColor: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: '10px', boxShadow: shadow.card }}>

          {/* Left — Image */}
          <div className="pd-media-col">
            <div className="pd-main-image" style={{
              backgroundColor: '#F5F5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(72px, 18vw, 110px)',
              overflow: 'hidden',
            }}>
              {product.images?.[activeThumb] ? (
                <img src={product.images[activeThumb]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
              ) : (
                <span>{product.icon}</span>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="pd-dots">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    className={`pd-dot ${activeThumb === i ? 'active' : ''}`}
                    onClick={() => setActiveThumb(i)}
                    aria-label={`Show image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {product.images?.length > 0 && (
              <div className="pd-thumbs">
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
          <div className="pd-info-col" style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {product.tag && <Pill label={product.tag} />}
              <Pill label={product.category} color={colors.muted} bg={colors.surface} />
              {discount && <Pill label={`-${discount}%`} color="#B91C1C" bg="#FEF2F2" />}
            </div>

            <h1 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: '800', color: colors.dark, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>

            {/* Fix: was `product.reviews`, a field that doesn't exist on
                the product object (backend calls it numReviews) — this
                always rendered "(undefined reviews)". */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stars rating={product.rating} />
              <span style={{ fontSize: '12.5px', fontWeight: '600', color: colors.dark }}>{product.rating}</span>
              <span style={{ fontSize: '11.5px', color: colors.muted }}>({product.numReviews || 0} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: 'clamp(1.25rem, 4vw, 1.8rem)', fontWeight: '800', color: colors.dark }}>₹{Math.round(product.price)}</span>
              {product.originalPrice && (
                <span style={{ fontSize: '13px', color: colors.muted, textDecoration: 'line-through' }}>₹{Math.round(product.originalPrice)}</span>
              )}
            </div>

            <div style={{ height: '1px', backgroundColor: colors.border }} />

            {/* Fix: product.colors.length would throw if colors was ever
                missing from the API response; now safely optional. */}
            {product.colors?.length > 0 && (
              <div>
                <p style={{ margin: '0 0 7px', fontSize: '11px', fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

            {product.sizes?.length > 0 && (
              <div>
                <p style={{ margin: '0 0 7px', fontSize: '11px', fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Size — <span style={{ color: colors.primary, textTransform: 'none', letterSpacing: 0 }}>{selectedSize}</span>
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className="size-btn"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: '38px',
                        height: '34px',
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

            <div>
              <p style={{ margin: '0 0 7px', fontSize: '11px', fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${colors.border}`, borderRadius: radius.sm, overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: '32px', height: '32px', background: 'none', border: 'none', fontSize: '17px', color: colors.dark, cursor: 'pointer', fontFamily: font.family, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span style={{ width: '30px', textAlign: 'center', fontSize: '13.5px', fontWeight: '700', color: colors.dark, fontFamily: font.family }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    style={{ width: '32px', height: '32px', background: 'none', border: 'none', fontSize: '17px', color: colors.dark, cursor: 'pointer', fontFamily: font.family, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
                <span style={{ fontSize: '11px', color: colors.muted }}>{product.stock} in stock</span>
              </div>
            </div>

            <div className="pd-cta-inline" style={{ gap: '8px', marginTop: '2px' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: radius.md, fontSize: '13px', fontWeight: '700',
                  fontFamily: font.family, border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: transition.base,
                  backgroundColor: added ? '#22C55E' : (product.stock === 0 ? colors.muted : colors.primary), color: '#fff', letterSpacing: '0.01em',
                }}
              >
                {added ? '✓ Added!' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: radius.md, fontSize: '13px', fontWeight: '700',
                  fontFamily: font.family, border: `1.5px solid ${colors.border}`, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: transition.base,
                  backgroundColor: colors.white, color: colors.dark, letterSpacing: '0.01em',
                }}
              >
                Buy now
              </button>
            </div>

            <Link
              href={`/shops/${product.shop?._id || product.shopId}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: colors.muted, textDecoration: 'none' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Sold by&nbsp;<span style={{ color: colors.primary, fontWeight: '600' }}>{product.shop?.name || product.shopName}</span>
            </Link>
          </div>
        </div>

        {/* Tabs section */}
        <div style={{ backgroundColor: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: '10px', boxShadow: shadow.card }}>

          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}` }}>
            {['description', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                className="tab-btn"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: activeTab === tab ? '700' : '500',
                  color: activeTab === tab ? colors.primary : colors.muted,
                  borderBottom: `2px solid ${activeTab === tab ? colors.primary : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: transition.base,
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'reviews' ? `Reviews (${product.numReviews || 0})` : tab}
              </button>
            ))}
          </div>

          <div style={{ padding: '14px' }}>

            {activeTab === 'description' && (
              <div style={{ maxWidth: '600px' }}>
                <p style={{ fontSize: '12.5px', color: colors.muted, lineHeight: '1.7', margin: '0 0 12px' }}>{product.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['Premium quality materials', 'Free shipping over ₹999', '30-day easy returns', '1 year warranty'].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.muted }}>
                      <svg width="14" height="14" fill="none" stroke="#22C55E" viewBox="0 0 24 24" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fix: this tab used to show three hardcoded fake reviews
                ("Sarah M.", "James K.", "Priya S.") on every single
                product, regardless of what real reviews existed —
                fabricated social proof shown to every customer. Now
                renders the product's actual reviews array (already
                populated with reviewer names via the backend). */}
            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px' }}>
                <ReviewForm productId={product._id} onSubmitted={handleReviewSubmitted} />
                {product.reviews?.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review._id} style={{ backgroundColor: colors.surface, borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: colors.primary }}>
                            {review.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: '600', color: colors.dark }}>{review.name}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: colors.muted }}>{timeAgo(review.createdAt)}</span>
                      </div>
                      <Stars rating={review.rating} size={12} />
                      <p style={{ margin: '5px 0 0', fontSize: '12px', color: colors.muted, lineHeight: '1.5' }}>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12.5px', color: colors.muted, textAlign: 'center', padding: '1.5rem 0' }}>
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', maxWidth: '600px' }}>
                {[
                  { icon: '🚀', title: 'Express', desc: '1–2 days · ₹99' },
                  { icon: '📦', title: 'Standard', desc: '3–5 days · Free over ₹999' },
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
          <div style={{ paddingBottom: '1.5rem' }}>
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
                      <span style={{ fontSize: '13px', fontWeight: '800', color: colors.dark }}>₹{Math.round(p.price)}</span>
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

      {/* Sticky Add to Cart / Buy Now — mobile only */}
      <div className="pd-cta-sticky">
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              flex: 1, padding: '12px 0', borderRadius: radius.md, fontSize: '13.5px', fontWeight: '700',
              fontFamily: font.family, border: `1.5px solid ${colors.primary}`, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: transition.base,
              backgroundColor: added ? '#22C55E' : colors.white, color: added ? '#fff' : colors.primary, letterSpacing: '0.01em',
              borderColor: added ? '#22C55E' : colors.primary,
            }}
          >
            {added ? '✓ Added!' : 'Add to cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            style={{
              flex: 1, padding: '12px 0', borderRadius: radius.md, fontSize: '13.5px', fontWeight: '700',
              fontFamily: font.family, border: 'none', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: transition.base,
              backgroundColor: colors.primary, color: '#fff', letterSpacing: '0.01em',
            }}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  )
}