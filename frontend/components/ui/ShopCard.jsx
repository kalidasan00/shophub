'use client'

import { useState } from 'react'
import Link from 'next/link'
import Badge from './Badge'
import StarRating from './StarRating'
import { colors, radius, shadow, transition, font } from '@/lib/styles'

export default function ShopCard({ shop }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/shops/${shop.id || shop._id}`}
      style={{
        backgroundColor: colors.white,
        borderRadius: radius.xxl,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: transition.slow,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? shadow.hover : shadow.card,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shop Image Banner */}
      <div style={{ position: 'relative', height: '140px', overflow: 'hidden', backgroundColor: shop.color || colors.primaryLight }}>
        {shop.logo && !imgError ? (
          <img
            src={shop.logo}
            alt={shop.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: transition.slow, transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: shop.color || colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
            {shop.icon}
          </div>
        )}

        {/* Badge overlay */}
        {shop.badge && (
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <Badge label={shop.badge} variant="primary" />
          </div>
        )}

        {/* Dark overlay on hover */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', transition: transition.base, ...(hovered && { backgroundColor: 'rgba(0,0,0,0.08)' }) }} />
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Shop name + category */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: hovered ? colors.primary : colors.dark,
          fontFamily: font.family,
          marginBottom: '4px',
          transition: transition.base,
        }}>
          {shop.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <span style={{ fontSize: font.sm, color: colors.muted, fontFamily: font.family }}>{shop.category}</span>
          {shop.location && (
            <>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: colors.muted, display: 'inline-block' }} />
              <span style={{ fontSize: font.sm, color: colors.muted, fontFamily: font.family }}>{shop.location}</span>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${colors.border}`, paddingTop: '12px', marginTop: 'auto' }}>
          <StarRating rating={shop.rating} reviews={shop.reviews || shop.numReviews} />
          <span style={{ fontSize: font.sm, color: colors.muted, fontFamily: font.family }}>
            {shop.products || shop.productCount || 0} products
          </span>
        </div>
      </div>
    </Link>
  )
}