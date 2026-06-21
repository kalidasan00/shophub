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
      <div style={{ position: 'relative', height: 'clamp(90px, 20vw, 140px)', overflow: 'hidden', backgroundColor: shop.color || colors.primaryLight }}>
        {shop.logo && !imgError ? (
          <img
            src={shop.logo}
            alt={shop.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: transition.slow, transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: shop.color || colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(28px, 7vw, 48px)' }}>
            {shop.icon}
          </div>
        )}

        {/* Badge overlay */}
        {shop.badge && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', transform: 'scale(0.85)', transformOrigin: 'top right' }}>
            <Badge label={shop.badge} variant="primary" />
          </div>
        )}

        {/* Dark overlay on hover */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', transition: transition.base, ...(hovered && { backgroundColor: 'rgba(0,0,0,0.08)' }) }} />
      </div>

      {/* Card Body */}
      <div style={{ padding: 'clamp(10px, 2.5vw, 16px)', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>

        {/* Shop name + category */}
        <h3 style={{
          fontSize: 'clamp(0.8rem, 1.8vw, 0.9375rem)',
          fontWeight: '600',
          color: hovered ? colors.primary : colors.dark,
          fontFamily: font.family,
          marginBottom: '4px',
          transition: transition.base,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {shop.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: 'clamp(8px, 2vw, 14px)', minWidth: 0, overflow: 'hidden' }}>
          <span style={{ fontSize: 'clamp(11px, 1.6vw, 12px)', color: colors.muted, fontFamily: font.family, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.category}</span>
          {shop.location && (
            <>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: colors.muted, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 'clamp(11px, 1.6vw, 12px)', color: colors.muted, fontFamily: font.family, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop.location}</span>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          borderTop: `1px solid ${colors.border}`,
          paddingTop: 'clamp(8px, 2vw, 12px)',
          marginTop: 'auto',
        }}>
          <StarRating rating={shop.rating} reviews={shop.reviews || shop.numReviews} />
          <span style={{ fontSize: 'clamp(10px, 1.6vw, 12px)', color: colors.muted, fontFamily: font.family, whiteSpace: 'nowrap' }}>
            {shop.products || shop.productCount || 0} products
          </span>
        </div>
      </div>
    </Link>
  )
}