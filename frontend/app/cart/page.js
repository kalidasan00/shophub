'use client'

import { useState } from 'react'
import Link from 'next/link'
import useCartStore from '@/store/useCartStore'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)

  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = couponApplied ? subtotal * 0.1 : 0
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal - discount + shipping

  const applyCoupon = () => {
    if (coupon.toLowerCase() === 'save10') {
      setCouponApplied(true)
      setCouponError(false)
    } else {
      setCouponError(true)
      setCouponApplied(false)
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 1rem', textAlign: 'center', fontFamily: font.family }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '1.5rem', border: `1px solid ${colors.border}` }}>
          🛒
        </div>
        <h2 style={{ fontSize: font.xl, fontWeight: '600', color: colors.dark, marginBottom: '8px' }}>Your cart is empty</h2>
        <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
        <Link href="/shops" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: colors.dark, color: colors.white, textDecoration: 'none', padding: '12px 24px', borderRadius: radius.md, fontSize: font.base, fontWeight: '500' }}>
          Browse Shops
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '700', color: colors.dark, marginBottom: '6px' }}>Your Cart</h1>
        <p style={{ fontSize: font.base, color: colors.muted }}>{items.length} item{items.length > 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <CartItem
              key={item.id || item._id}
              item={item}
              onRemove={removeItem}
              onUpdateQty={updateQuantity}
            />
          ))}

          <Link
            href="/shops"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: font.base, color: colors.primary, textDecoration: 'none', fontWeight: '500', marginTop: '8px' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div style={{ backgroundColor: colors.white, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '1.5rem', boxShadow: shadow.card, position: 'sticky', top: '80px' }}>
          <h2 style={{ fontSize: font.lg, fontWeight: '600', color: colors.dark, marginBottom: '1.25rem' }}>Order Summary</h2>

          {/* Price Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: font.base }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>Subtotal</span>
              <span style={{ fontWeight: '500', color: colors.dark }}>${subtotal.toFixed(2)}</span>
            </div>
            {couponApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                <span>Discount (10%)</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>Shipping</span>
              <span style={{ fontWeight: '500', color: shipping === 0 ? '#16A34A' : colors.dark }}>
                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping > 0 && (
              <p style={{ fontSize: font.xs, color: '#9CA3AF' }}>
                Add ${(50 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${colors.border}`, margin: '1.25rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: font.md, fontWeight: '600', color: colors.dark }}>Total</span>
            <span style={{ fontSize: '22px', fontWeight: '700', color: colors.dark }}>${total.toFixed(2)}</span>
          </div>

          {/* Coupon */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: font.base, fontWeight: '500', color: colors.dark, marginBottom: '8px' }}>Coupon Code</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter code"
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setCouponError(false) }}
                style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '9px 12px', fontSize: font.base, fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white }}
                onFocus={(e) => e.target.style.borderColor = colors.primary}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
              <button
                onClick={applyCoupon}
                style={{ padding: '9px 16px', border: `1px solid ${colors.border}`, borderRadius: radius.md, fontSize: font.base, fontFamily: font.family, cursor: 'pointer', backgroundColor: colors.white, color: colors.dark, fontWeight: '500', whiteSpace: 'nowrap' }}
              >
                Apply
              </button>
            </div>
            {couponApplied && (
              <p style={{ fontSize: font.sm, color: '#16A34A', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Coupon applied — 10% off
              </p>
            )}
            {couponError && (
              <p style={{ fontSize: font.sm, color: colors.red, marginTop: '6px' }}>Invalid code. Try SAVE10</p>
            )}
          </div>

          {/* Checkout */}
          <Link
            href="/checkout"
            style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: colors.primary, color: colors.white, textDecoration: 'none', textAlign: 'center', borderRadius: radius.md, fontSize: font.md, fontWeight: '600', boxSizing: 'border-box' }}
          >
            Proceed to Checkout
          </Link>

          {/* Trust Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '1rem' }}>
            {[
              { icon: '🔒', label: 'Secure Pay' },
              { icon: '🔄', label: 'Easy Returns' },
              { icon: '🚀', label: 'Fast Ship' },
            ].map((badge) => (
              <div key={badge.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', backgroundColor: colors.surface, borderRadius: radius.md }}>
                <span style={{ fontSize: '18px' }}>{badge.icon}</span>
                <span style={{ fontSize: font.xs, color: colors.muted, fontWeight: '500' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CartItem({ item, onRemove, onUpdateQty }) {
  const [removeHovered, setRemoveHovered] = useState(false)
  const itemKey = item.id || item._id

  return (
    <div style={{ backgroundColor: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '1rem', display: 'flex', gap: '1rem', boxShadow: shadow.card }}>

      {/* Image or Icon */}
      <div style={{ width: '72px', height: '72px', minWidth: '72px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
            {item.icon}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: font.md, fontWeight: '500', color: colors.dark, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
            <p style={{ fontSize: font.sm, color: colors.muted }}>
              {typeof item.shop === 'object' ? item.shop?.name : item.shop}
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {item.size && (
                <span style={{ fontSize: '11px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.muted, padding: '2px 8px', borderRadius: '6px' }}>
                  Size: {item.size}
                </span>
              )}
              {item.color && (
                <span style={{ fontSize: '11px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.muted, padding: '2px 8px', borderRadius: '6px' }}>
                  Color: {item.color}
                </span>
              )}
            </div>
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(itemKey)}
            onMouseEnter={() => setRemoveHovered(true)}
            onMouseLeave={() => setRemoveHovered(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: removeHovered ? colors.red : '#9CA3AF', padding: '4px', borderRadius: '6px', flexShrink: 0, transition: transition.base }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price + Qty */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => onUpdateQty(itemKey, item.quantity - 1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, cursor: 'pointer', fontSize: '16px', color: colors.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.family }}
            >−</button>
            <span style={{ width: '28px', textAlign: 'center', fontSize: font.base, fontWeight: '500', color: colors.dark }}>{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(itemKey, item.quantity + 1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.white, cursor: 'pointer', fontSize: '16px', color: colors.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.family }}
            >+</button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: font.md, fontWeight: '600', color: colors.dark }}>${(item.price * item.quantity).toFixed(2)}</p>
            {item.originalPrice && (
              <p style={{ fontSize: font.sm, color: '#9CA3AF', textDecoration: 'line-through' }}>${(item.originalPrice * item.quantity).toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}