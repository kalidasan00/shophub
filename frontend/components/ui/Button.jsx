'use client'

import { useState } from 'react'
import { colors, radius, font, transition } from '@/lib/styles'

const variants = {
  primary: {
    base: { backgroundColor: colors.primary, color: 'white', border: 'none' },
    hover: { backgroundColor: colors.primaryDark },
  },
  outline: {
    base: { backgroundColor: 'transparent', color: colors.dark, border: `1px solid ${colors.border}` },
    hover: { backgroundColor: colors.surface, borderColor: colors.primary, color: colors.primary },
  },
  ghost: {
    base: { backgroundColor: 'transparent', color: colors.muted, border: 'none' },
    hover: { backgroundColor: colors.surface, color: colors.dark },
  },
  danger: {
    base: { backgroundColor: '#FEF2F2', color: colors.red, border: `1px solid #FECACA` },
    hover: { backgroundColor: '#FEE2E2' },
  },
  success: {
    base: { backgroundColor: '#22C55E', color: 'white', border: 'none' },
    hover: { backgroundColor: '#16A34A' },
  },
}

const sizes = {
  sm: { padding: '6px 14px', fontSize: font.sm },
  md: { padding: '10px 20px', fontSize: font.base },
  lg: { padding: '13px 28px', fontSize: font.md },
  full: { padding: '13px 28px', fontSize: font.md, width: '100%' },
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  style = {},
}) {
  const [hovered, setHovered] = useState(false)
  const v = variants[variant]
  const s = sizes[size]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: radius.md,
        fontFamily: font.family,
        fontWeight: '600',
        cursor: disabled ? 'not-allowed',
        opacity: disabled ? 0.6 : 1,
        transition: transition.base,
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        ...s,
        ...v.base,
        ...(hovered && !disabled ? v.hover : {}),
        ...style,
      }}
    >
      {children}
    </button>
  )
}