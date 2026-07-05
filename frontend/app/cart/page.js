'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft, X, Tag, Check, Lock, RotateCcw, Zap, Package } from 'lucide-react'
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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

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
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: `1px solid ${colors.border}` }}>
          <ShoppingCart size={36} color={colors.muted} strokeWidth={1.5} />
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
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family, paddingBottom: '156px' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 1rem' }}>
        <Link href="/shops" aria-label="Back" style={{ display: 'flex', color: colors.dark }}>
          <ChevronLeft size={20} />
        </Link>
        <span style={{ fontSize: '15px', fontWeight: '700', color: colors.dark }}>
          My cart <span style={{ fontWeight: '400', color: colors.muted }}>({itemCount} item{itemCount > 1 ? 's' : ''})</span>
        </span>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '10px 1rem 0' }}>

        {/* Cart items */}
        <div style={{ backgroundColor: colors.white, borderRadius: radius.lg, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <CartItem
              key={item.id || item._id}
              item={item}
              isFirst={i === 0}
              onRemove={removeItem}
              onUpdateQty={updateQuantity}
            />
          ))}
        </div>

        <Link
          href="/shops"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: font.sm, color: colors.primary, textDecoration: 'none', fontWeight: '500', margin: '10px 0 0' }}
        >
          Continue shopping
        </Link>

        {/* Coupon */}
        <div style={{ backgroundColor: colors.white, borderRadius: radius.lg, border: `1px solid ${colors.border}`, padding: '12px 14px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: couponApplied || couponError ? '8px' : 0 }}>
            <Tag size={15} color={colors.primary} />
            <input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => { setCoupon(e.target.value); setCouponError(false) }}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: font.sm, fontFamily: font.family, color: colors.dark, backgroundColor: 'transparent' }}
            />
            <button
              onClick={applyCoupon}
              style={{ padding: '6px 14px', border: 'none', borderRadius: radius.full, fontSize: '12px', fontFamily: font.family, cursor: 'pointer', backgroundColor: colors.primary, color: colors.white, fontWeight: '600', whiteSpace: 'nowrap' }}
            >
              Apply
            </button>
          </div>
          {couponApplied && (
            <p style={{ fontSize: font.xs, color: '#16A34A', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={13} strokeWidth={2} />
              Coupon applied — 10% off
            </p>
          )}
          {couponError && (
            <p style={{ fontSize: font.xs, color: colors.red, margin: 0 }}>Invalid code. Try SAVE10</p>
          )}
        </div>

        {/* Price details */}
        <div style={{ backgroundColor: colors.white, borderRadius: radius.lg, border: `1px solid ${colors.border}`, padding: '14px', marginTop: '12px' }}>
          <p style={{ fontSize: font.sm, fontWeight: '700', color: colors.dark, margin: '0 0 10px' }}>Price details</p>

          <PriceRow label="Subtotal" value={`₹${Math.round(subtotal)}`} />
          {couponApplied && (
            <PriceRow label="Discount (10%)" value={`− ₹${Math.round(discount)}`} valueColor="#16A34A" />
          )}
          <PriceRow label="Shipping" value={shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`} valueColor={shipping === 0 ? '#16A34A' : undefined} />
          {shipping > 0 && (
            <p style={{ fontSize: font.xs, color: '#9CA3AF', margin: '2px 0 0' }}>
              Add ₹{Math.round(50 - subtotal)} more for free shipping
            </p>
          )}

          <div style={{ borderTop: `1px dashed ${colors.border}`, margin: '10px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: font.md, fontWeight: '700', color: colors.dark }}>Total</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: colors.dark }}>₹{Math.round(total)}</span>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '12px 0 0' }}>
          {[
            { icon: <Lock size={16} strokeWidth={1.5} color={colors.muted} />, label: 'Secure pay' },
            { icon: <RotateCcw size={16} strokeWidth={1.5} color={colors.muted} />, label: 'Easy returns' },
            { icon: <Zap size={16} strokeWidth={1.5} color={colors.muted} />, label: 'Fast ship' },
          ].map((badge) => (
            <div key={badge.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.md }}>
              {badge.icon}
              <span style={{ fontSize: font.xs, color: colors.muted, fontWeight: '500', textAlign: 'center' }}>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky checkout bar — sits above the global bottom tab nav (Home/Shops/Categories/Login), not underneath it */}
      <div style={{ position: 'fixed', bottom: '64px', left: 0, right: 0, backgroundColor: colors.white, borderTop: `1px solid ${colors.border}`, boxShadow: shadow.card, padding: '10px 1rem', zIndex: 20 }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: colors.dark }}>₹{Math.round(total)}</p>
            {couponApplied && (
              <p style={{ margin: 0, fontSize: font.xs, color: '#16A34A', fontWeight: '600' }}>You saved ₹{Math.round(discount)}</p>
            )}
          </div>
          <Link
            href="/checkout"
            style={{ backgroundColor: colors.primary, color: colors.white, textDecoration: 'none', textAlign: 'center', borderRadius: radius.md, padding: '12px 28px', fontSize: font.base, fontWeight: '700' }}
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

function CartItem({ item, isFirst, onRemove, onUpdateQty }) {
  const itemKey = item.id || item._id

  return (
    <div style={{ display: 'flex', gap: '10px', padding: '12px', borderTop: isFirst ? 'none' : `1px solid ${colors.border}` }}>

      {/* Image or fallback */}
      <div style={{ width: '68px', height: '68px', minWidth: '68px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '10px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Package size={24} color={colors.muted} strokeWidth={1.5} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
          <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '600', color: colors.dark, lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.name}
          </p>
          <button
            onClick={() => onRemove(itemKey)}
            aria-label="Remove item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', color: '#B5B5C3' }}
          >
            <X size={15} />
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '11px', color: colors.muted }}>
          {typeof item.shop === 'object' ? item.shop?.name : item.shop}
          {(item.size || item.color) && ' · '}
          {item.size && `Size: ${item.size}`}
          {item.size && item.color && ' · '}
          {item.color && `Color: ${item.color}`}
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: colors.dark }}>₹{Math.round(item.price)}</span>
          {item.originalPrice && (
            <span style={{ fontSize: '10.5px', color: '#B5B5C3', textDecoration: 'line-through' }}>₹{Math.round(item.originalPrice)}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: colors.dark }}>₹{Math.round(item.price * item.quantity)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: `1px solid ${colors.primary}`, borderRadius: radius.full, padding: '2px 3px', flexShrink: 0 }}>
            <button
              onClick={() => onUpdateQty(itemKey, item.quantity - 1)}
              style={{ width: '18px', height: '18px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', color: colors.primary, fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.family }}
            >−</button>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: colors.dark, minWidth: '12px', textAlign: 'center' }}>{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(itemKey, item.quantity + 1)}
              style={{ width: '18px', height: '18px', borderRadius: '50%', border: 'none', backgroundColor: colors.primary, color: colors.white, fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.family }}
            >+</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PriceRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
      <span style={{ fontSize: font.sm, color: colors.muted }}>{label}</span>
      <span style={{ fontSize: font.sm, fontWeight: '600', color: valueColor || colors.dark }}>{value}</span>
    </div>
  )
}