'use client'

import { useState } from 'react'
import Link from 'next/link'
import Badge from './Badge'
import StarRating from './StarRating'
import { colors, radius, shadow, transition, font } from '@/lib/styles'
import useCartStore from '@/store/useCartStore'

export default function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  const productId = product._id || product.id

  // Fix: qty used to be local state starting at 0 every render, which
  // could drift from the actual cart contents (e.g. clicking "-" only
  // updated this card's number, never the cart store — customer could
  // see "1" here while the cart/checkout still had 3). Deriving it
  // directly from the store keeps the displayed number always correct,
  // including on first render if the item was already in the cart.
  const cartItem = useCartStore((state) =>
    state.items.find((i) => i.id === productId && !i.selectedSize && !i.selectedColor)
  )
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const qty = cartItem?.quantity ?? 0

  // Defensive: images may be an array of URL strings, or an array of
  // objects like { url, public_id } depending on how the backend stores them.
  const rawImage = product.images?.[0]
  const mainImage = typeof rawImage === 'string' ? rawImage : rawImage?.url

  const handleIncrement = (e) => {
    e.preventDefault()
    onAddToCart?.(product)
  }

  const handleDecrement = (e) => {
    e.preventDefault()
    if (qty <= 1) {
      removeItem(productId, undefined, undefined)
    } else {
      updateQuantity(productId, undefined, undefined, qty - 1)
    }
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        border: `1px solid ${hovered ? colors.primary + '33' : colors.border}`,
        overflow: 'hidden',
        transition: transition.slow,
        boxShadow: hovered ? shadow.hover : shadow.card,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE */}
      <Link href={`/products/${productId}`} style={{ textDecoration: 'none', display: 'block', position: 'relative' }}>
        <div style={{
          aspectRatio: '1 / 1',
          backgroundColor: '#F5F5F5',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {mainImage && !imgError ? (
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: transition.slow,
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: hovered ? colors.primaryLight : colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              transition: transition.base,
            }}>
              {product.icon || '📦'}
            </div>
          )}

          {/* discount pill */}
          {discount && (
            <span style={{
              position: 'absolute', top: '5px', left: '5px',
              backgroundColor: '#EF4444', color: '#fff',
              fontSize: '9px', fontWeight: '700',
              padding: '1px 5px', borderRadius: '999px',
              fontFamily: font.family,
            }}>
              -{discount}%
            </span>
          )}

          {/* tag badge */}
          {product.tag && (
            <span style={{ position: 'absolute', top: '5px', right: '5px' }}>
              <Badge label={product.tag} variant="primary" />
            </span>
          )}
        </div>
      </Link>

      {/* INFO */}
      <div style={{ padding: '5px 6px 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

        <Link href={`/products/${productId}`} style={{ textDecoration: 'none' }}>
          <p style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: '600',
            color: hovered ? colors.primary : colors.dark,
            fontFamily: font.family,
            lineHeight: '1.2',
            transition: transition.base,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.name}
          </p>
        </Link>

        <StarRating rating={product.rating} reviews={product.reviews || product.numReviews} />

        {/* Price + cart — action slot is a fixed width so switching to the
            qty stepper never reflows the row or resizes the card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1px', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: colors.dark, fontFamily: font.family, whiteSpace: 'nowrap' }}>
              ₹{Math.round(product.price)}
            </span>
            {product.originalPrice && (
              <span style={{ fontSize: '9px', color: colors.muted, textDecoration: 'line-through', fontFamily: font.family, whiteSpace: 'nowrap' }}>
                ₹{Math.round(product.originalPrice)}
              </span>
            )}
          </div>

          <div style={{ width: '52px', minWidth: '52px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
            {qty === 0 ? (
              <button onClick={handleIncrement} aria-label="Add to cart" style={{
                backgroundColor: colors.primary, color: '#fff', border: 'none',
                borderRadius: '50%', width: '20px', height: '20px', minWidth: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                flexShrink: 0, transition: transition.base,
              }}>+</button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '2px',
                backgroundColor: '#F0FDF4', border: '1px solid #22C55E',
                borderRadius: '999px', padding: '1px 3px', flexShrink: 0,
              }}>
                <button onClick={handleDecrement} aria-label="Decrease quantity" style={{
                  backgroundColor: 'transparent', color: '#22C55E', border: 'none',
                  width: '14px', height: '14px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0, flexShrink: 0,
                }}>−</button>
                <span style={{ fontSize: '9.5px', fontWeight: '700', color: '#16A34A', minWidth: '9px', textAlign: 'center', fontFamily: font.family }}>
                  {qty}
                </span>
                <button onClick={handleIncrement} aria-label="Increase quantity" style={{
                  backgroundColor: '#22C55E', color: '#fff', border: 'none',
                  width: '14px', height: '14px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '700', cursor: 'pointer', padding: 0, flexShrink: 0,
                }}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}