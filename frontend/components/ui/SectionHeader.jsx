'use client'

import { useState } from 'react'
import Link from 'next/link'
import { colors, font } from '@/lib/styles'

/**
 * @param {{ title: string, subtitle?: string, linkLabel?: string, linkHref?: string }} props
 */
export default function SectionHeader({ title, subtitle, linkLabel, linkHref }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
      <div>
        <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: '700', color: colors.dark, marginBottom: '4px', fontFamily: font.family }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: font.base, color: colors.muted, fontFamily: font.family }}>
            {subtitle}
          </p>
        )}
      </div>
      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ fontSize: font.base, fontWeight: '500', color: hovered ? colors.primaryDark : colors.primary, textDecoration: hovered ? 'underline' : 'none', fontFamily: font.family, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}