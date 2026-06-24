'use client'

import { useState } from 'react'
import Link from 'next/link'
import Badge from './Badge'
import StarRating from './StarRating'
import { colors, radius, shadow, transition, font } from '@/lib/styles'

/**
 * @param {{ product: any, onAddToCart?: (product: any) => void }} props
 */
export default function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false)
  const [qty, setQty] = useState(0)
  const [imgError, setImgError] = useState(false)

  const productId = product._id || product.id
  const mainImage = product.images?.[0]

  const handleAdd = (e) => {
    e.preventDefault()
    setQty(q => q + 1)
    onAddToCart?.(product)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: radius.xxl,
        border: `1px solid ${hovered ? colors.primary + '33' : colors.border}`,
        overflow: 'hidden',
        transition: transition.slow,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? shadow.hover : shadow.card,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── IMAGE AREA (dominant) ── */}
      <Link href={`/products/${productId}`} style={{ textDecoration: 'none', display: 'block', position: 'relative' }}>
        <div style={{
          aspectRatio: '4 / 5',
          backgroundColor: '#F5F5F5',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {mainImage && !imgError ? (
            <img
              src={mainImage}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                transition: transition.slow,
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
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
              fontSize: 'clamp(48px, 10vw, 72px)',
              transition: transition.base,
            }}>
              {product.icon}
            </div>
          )}

          {/* Floating: discount pill — top left */}
          {discount && (
            <span style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: '#EF4444',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: radius.full,
              fontFamily: font.family,
              letterSpacing: '0.02em',
            }}>
              -{discount}%
            </span>
          )}

          {/* Floating: tag badge — top right */}
          {product.tag && (
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}>
              <Badge label={product.tag} variant="primary" />
            </span>
          )}
        </div>
      </Link>

      {/* ── SLIM INFO STRIP ── */}
      <div style={{
        padding: '8px 10px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>

        {/* Product name */}
        <Link href={`/products/${productId}`} style={{ textDecoration: 'none' }}>
          <p style={{
            margin: 0,
            fontSize: 'clamp(0.78rem, 1.5vw, 0.875rem)',
            fontWeight: '600',
            color: hovered ? colors.primary : colors.dark,
            fontFamily: font.family,
            lineHeight: '1.3',
            transition: transition.base,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.name}
          </p>
        </Link>

        {/* Rating indicator — compact */}
        <StarRating rating={product.rating} reviews={product.reviews || product.numReviews} />

        {/* Price row + cart button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '2px',
        }}>
          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
            <span style={{
              fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
              fontWeight: '700',
              color: colors.dark,
              fontFamily: font.family,
            }}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span style={{
                fontSize: '11px',
                color: colors.muted,
                textDecoration: 'line-through',
                fontFamily: font.family,
              }}>
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Cart control */}
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              aria-label="Add to cart"
              style={{
                backgroundColor: colors.primary,
                color: '#fff',
                border: 'none',
                borderRadius: radius.full,
                width: '28px',
                height: '28px',
                minWidth: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                lineHeight: 1,
                cursor: 'pointer',
                fontFamily: font.family,
                transition: transition.base,
                flexShrink: 0,
              }}
            >
              +
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #22C55E',
              borderRadius: radius.full,
              padding: '2px 4px',
              flexShrink: 0,
            }}>
              <button
                onClick={(e) => { e.preventDefault(); setQty(q => q - 1) }}
                aria-label="Remove one"
                style={{
                  backgroundColor: 'transparent',
                  color: '#22C55E',
                  border: 'none',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                −
              </button>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#16A34A',
                minWidth: '14px',
                textAlign: 'center',
                fontFamily: font.family,
              }}>
                {qty}
              </span>
              <button
                onClick={handleAdd}
                aria-label="Add one more"
                style={{
                  backgroundColor: '#22C55E',
                  color: '#fff',
                  border: 'none',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}