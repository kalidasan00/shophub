'use client'

import { useState } from 'react'
import Link from 'next/link'
import Badge from './Badge'
import StarRating from './StarRating'
import { colors, radius, shadow, transition, font } from '@/lib/styles'

export default function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const productId = product._id || product.id
  const mainImage = product.images?.[0]

  const handleAdd = (e) => {
    e.preventDefault()
    setAdded(true)
    onAddToCart?.(product)
    setTimeout(() => setAdded(false), 1500)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: radius.xxl,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        transition: transition.slow,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? shadow.hover : shadow.card,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link href={`/products/${productId}`} style={{ textDecoration: 'none' }}>
        <div style={{
          height: '180px',
          backgroundColor: hovered ? colors.primaryLight : colors.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: `1px solid ${colors.border}`,
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
                transition: transition.slow,
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
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
              fontSize: '56px',
              transition: transition.base,
            }}>
              {product.icon}
            </div>
          )}

          {/* Discount badge */}
          {discount && (
            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#EF4444', color: 'white', fontSize: font.xs, fontWeight: '700', padding: '3px 8px', borderRadius: radius.full }}>
              -{discount}%
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Tag + Name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <Link href={`/products/${productId}`} style={{ textDecoration: 'none', flex: 1 }}>
            <h3 style={{
              fontSize: font.base,
              fontWeight: '600',
              color: hovered ? colors.primary : colors.dark,
              fontFamily: font.family,
              lineHeight: '1.4',
              transition: transition.base,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {product.name}
            </h3>
          </Link>
          {product.tag && <Badge label={product.tag} variant="primary" />}
        </div>

        {/* Rating */}
        <div style={{ marginBottom: '12px' }}>
          <StarRating rating={product.rating} reviews={product.reviews || product.numReviews} />
        </div>

        {/* Price + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: colors.dark, fontFamily: font.family }}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span style={{ fontSize: font.sm, color: colors.muted, textDecoration: 'line-through', marginLeft: '6px', fontFamily: font.family }}>
                ${product.originalPrice}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            style={{
              backgroundColor: added ? '#22C55E' : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: radius.sm,
              padding: '7px 14px',
              fontSize: font.xs,
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: font.family,
              transition: transition.base,
              whiteSpace: 'nowrap',
            }}
          >
            {added ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}