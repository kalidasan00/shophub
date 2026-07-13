'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Ticket, Copy, Check, Clock, Tag,
} from 'lucide-react'
import { colors, font, radius, shadow } from '@/lib/styles'

/* ── Shared style tokens (reused from account hub / wallet) ── */
const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: radius.xxl,
  border: `1px solid ${colors.border}`,
  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
  boxShadow: shadow.card,
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: colors.muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 8px 2px',
}

/* ── Mock data (frontend-first, backend wiring comes later) ── */
type Coupon = {
  id: string
  code: string
  title: string
  description: string
  discountType: 'flat' | 'percent'
  discountValue: number
  maxDiscount?: number
  minOrderValue: number
  expiryDate: string
  scope: string
  status: 'active' | 'used' | 'expired'
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'cpn_001',
    code: 'WELCOME50',
    title: 'Flat ₹50 off',
    description: 'On your first order above ₹299',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 299,
    expiryDate: '2026-08-15',
    scope: 'All categories',
    status: 'active',
  },
  {
    id: 'cpn_002',
    code: 'FASHION20',
    title: '20% off',
    description: 'On fashion & apparel, up to ₹300',
    discountType: 'percent',
    discountValue: 20,
    maxDiscount: 300,
    minOrderValue: 999,
    expiryDate: '2026-07-31',
    scope: 'Fashion',
    status: 'active',
  },
  {
    id: 'cpn_003',
    code: 'FESTIVE100',
    title: 'Flat ₹100 off',
    description: 'Site-wide festive discount',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 799,
    expiryDate: '2026-07-20',
    scope: 'All categories',
    status: 'active',
  },
  {
    id: 'cpn_004',
    code: 'ELECTRO15',
    title: '15% off',
    description: 'On electronics, up to ₹500',
    discountType: 'percent',
    discountValue: 15,
    maxDiscount: 500,
    minOrderValue: 1499,
    expiryDate: '2026-06-30',
    scope: 'Electronics',
    status: 'expired',
  },
  {
    id: 'cpn_005',
    code: 'NEWUSER30',
    title: 'Flat ₹30 off',
    description: 'Applied on order #SH-10188',
    discountType: 'flat',
    discountValue: 30,
    minOrderValue: 199,
    expiryDate: '2026-06-25',
    scope: 'All categories',
    status: 'used',
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function discountLabel(c: Coupon) {
  if (c.discountType === 'flat') return `₹${c.discountValue} OFF`
  return `${c.discountValue}% OFF`
}

/* ── Coupon Card ── */
function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false)
  const isActive = coupon.status === 'active'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard access denied — silently ignore, code is visible on the card anyway
    }
  }

  return (
    <div style={{
      display: 'flex',
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      overflow: 'hidden',
      marginBottom: '12px',
      opacity: isActive ? 1 : 0.55,
      backgroundColor: colors.white,
    }}>
      {/* Left discount stub */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '4px',
        minWidth: '92px',
        padding: '14px 10px',
        backgroundColor: isActive ? colors.primaryLight : colors.surface,
        borderRight: `1px dashed ${colors.border}`,
      }}>
        <Tag size={16} color={isActive ? colors.primary : colors.muted} strokeWidth={1.8} />
        <span style={{ fontSize: '12px', fontWeight: '700', color: isActive ? colors.primary : colors.muted, textAlign: 'center', lineHeight: 1.2 }}>
          {discountLabel(coupon)}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: font.base, fontWeight: '600', color: colors.dark, margin: 0 }}>{coupon.title}</p>
            <p style={{ fontSize: '13px', color: colors.muted, margin: '2px 0 0' }}>{coupon.description}</p>
          </div>

          {coupon.status === 'used' && (
            <span style={{ fontSize: '11px', fontWeight: '700', color: colors.muted, backgroundColor: colors.surface, padding: '3px 9px', borderRadius: radius.md, whiteSpace: 'nowrap' }}>
              USED
            </span>
          )}
          {coupon.status === 'expired' && (
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#EF4444', backgroundColor: '#FEF2F2', padding: '3px 9px', borderRadius: radius.md, whiteSpace: 'nowrap' }}>
              EXPIRED
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
          <Clock size={13} color={colors.muted} />
          <span style={{ fontSize: '12px', color: colors.muted }}>
            {coupon.status === 'active' ? `Valid till ${formatDate(coupon.expiryDate)}` : `Expired ${formatDate(coupon.expiryDate)}`}
            {' · '}Min. order ₹{coupon.minOrderValue}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: '700',
            color: colors.dark,
            letterSpacing: '0.04em',
            border: `1px dashed ${colors.border}`,
            borderRadius: radius.md,
            padding: '4px 10px',
          }}>
            {coupon.code}
          </span>

          {isActive && (
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: font.family,
                fontSize: '13px',
                fontWeight: '600',
                color: copied ? '#16A34A' : colors.primary,
                padding: '4px 6px',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy code'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Coupons Page ── */
export default function CouponsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'active' | 'used' | 'expired'>('active')

  const filteredCoupons = MOCK_COUPONS.filter((c) => c.status === filter)
  const activeCount = MOCK_COUPONS.filter((c) => c.status === 'active').length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>

      {/* Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 2rem) 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => router.push('/account')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              aria-label="Back to account"
            >
              <ChevronLeft size={22} color={colors.dark} />
            </button>
            <h1 style={{ fontSize: '17px', fontWeight: '700', color: colors.dark, margin: 0 }}>Coupons</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.25rem, 3vw, 2rem) 1.25rem 4rem' }}>

        {/* Summary banner */}
        <div style={{
          ...cardStyle,
          background: `linear-gradient(135deg, ${colors.primary} 0%, #4F46E5 100%)`,
          border: 'none',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '44px', height: '44px', minWidth: '44px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ticket size={20} color={colors.white} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: colors.white, margin: 0 }}>
              {activeCount} coupon{activeCount !== 1 ? 's' : ''} available
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '2px 0 0' }}>
              Apply at checkout to save on your order
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <p style={sectionLabelStyle}>Your coupons</p>
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            {(['active', 'used', 'expired'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 16px',
                  borderRadius: radius.md,
                  border: `1px solid ${filter === f ? colors.primary : colors.border}`,
                  backgroundColor: filter === f ? colors.primaryLight : 'transparent',
                  color: filter === f ? colors.primary : colors.muted,
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: font.family,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredCoupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Ticket size={32} color={colors.muted} style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>No {filter} coupons right now.</p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} />)
          )}
        </div>
      </div>
    </div>
  )
}