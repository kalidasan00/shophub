'use client'

import Link from 'next/link'
import { Shirt, Laptop, UtensilsCrossed, Sparkles, Dumbbell, BookOpen, Home as HomeIcon, Gamepad2 } from 'lucide-react'
import { colors, font, radius } from '@/lib/styles'

const categories = [
  { label: 'Fashion', Icon: Shirt, color: '#FEF3C7', desc: 'Clothing, shoes & accessories' },
  { label: 'Electronics', Icon: Laptop, color: '#EEF2FF', desc: 'Gadgets, laptops & phones' },
  { label: 'Food', Icon: UtensilsCrossed, color: '#FEE2E2', desc: 'Fresh, organic & delicious' },
  { label: 'Beauty', Icon: Sparkles, color: '#FCE7F3', desc: 'Skincare & cosmetics' },
  { label: 'Sports', Icon: Dumbbell, color: '#D1FAE5', desc: 'Fitness & outdoor gear' },
  { label: 'Books', Icon: BookOpen, color: '#FEF9C3', desc: 'Fiction, non-fiction & more' },
  { label: 'Home', Icon: HomeIcon, color: '#E0F2FE', desc: 'Decor & furniture' },
  { label: 'Toys', Icon: Gamepad2, color: '#F3E8FF', desc: 'Fun for all ages' },
]

export default function CategoriesPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>

      {/* Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) 1.25rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '800', color: colors.dark, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            All Categories
          </h1>
          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: colors.muted, lineHeight: '1.6' }}>
            Browse shops by what you're looking for
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1.25rem, 3vw, 2.5rem) 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {categories.map(({ label, Icon, color, desc }) => (
            <Link
              key={label}
              href={`/shops?category=${label.toLowerCase()}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: 'clamp(14px, 3vw, 20px)',
                borderRadius: radius.xxl,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.white,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: 'clamp(40px, 9vw, 56px)',
                height: 'clamp(40px, 9vw, 56px)',
                borderRadius: '14px',
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={24} color={colors.dark} strokeWidth={1.75} />
              </div>
              <div>
                <h3 style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', fontWeight: '700', color: colors.dark, marginBottom: '2px' }}>
                  {label}
                </h3>
                <p style={{ fontSize: 'clamp(11px, 1.8vw, 13px)', color: colors.muted, lineHeight: '1.4' }}>
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}