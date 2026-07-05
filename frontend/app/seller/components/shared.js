import { colors, font, radius, transition } from '@/lib/styles'

/* ── Shared constants used across seller components ── */
export const categories    = ['Fashion', 'Electronics', 'Food', 'Beauty', 'Sports', 'Books', 'Home', 'Toys', 'Other']
export const productTags   = ['New', 'Sale', 'Popular', 'Top Rated', 'Trending', 'Fresh', '']
export const orderStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export const statusStyles = {
  placed:     { bg: '#EEF2FF', text: '#6366F1' },
  confirmed:  { bg: '#EFF6FF', text: '#3B82F6' },
  processing: { bg: '#FEF3C7', text: '#D97706' },
  shipped:    { bg: '#E0F2FE', text: '#0284C7' },
  delivered:  { bg: '#DCFCE7', text: '#16A34A' },
  cancelled:  { bg: '#FEE2E2', text: '#EF4444' },
}

export const gradientPresets = [
  { label: 'Indigo Violet', from: '#6366F1', to: '#8B5CF6', direction: '135deg' },
  { label: 'Rose Sunset',   from: '#F43F5E', to: '#F97316', direction: '135deg' },
  { label: 'Ocean Blue',    from: '#0EA5E9', to: '#6366F1', direction: '135deg' },
  { label: 'Emerald',       from: '#10B981', to: '#0EA5E9', direction: '135deg' },
  { label: 'Peach',         from: '#F97316', to: '#FBBF24', direction: '135deg' },
  { label: 'Midnight',      from: '#1E1B4B', to: '#4C1D95', direction: '135deg' },
  { label: 'Pink Dream',    from: '#EC4899', to: '#A855F7', direction: '135deg' },
  { label: 'Slate Cool',    from: '#475569', to: '#0EA5E9', direction: '135deg' },
]

export const directions = [
  { label: '→',  value: '90deg'  },
  { label: '↘',  value: '135deg' },
  { label: '↓',  value: '180deg' },
  { label: '↙',  value: '225deg' },
]

export const DEFAULT_GRADIENT = { from: '#6366F1', to: '#8B5CF6', direction: '135deg' }

/* ── Flatter, restrained design tokens (thin border instead of heavy shadow) ── */
export const inputStyle = {
  width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.md,
  padding: '11px 14px', fontSize: font.base, fontFamily: font.family,
  outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box',
}

export const iconBtnStyle = {
  width: '32px', height: '32px', borderRadius: radius.md,
  border: `1px solid ${colors.border}`, backgroundColor: colors.white,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: colors.dark, transition: transition.fast,
}

export const flatCardStyle = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.xxl,
  padding: '1.25rem',
}

export const sectionLabelStyle = {
  fontSize: '11px',
  fontWeight: '600',
  color: colors.muted,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: '0 0 8px 2px',
}

/* ── Small shared components ── */
export function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: colors.dark, marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  )
}

export function ErrorBox({ children }) {
  return (
    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: '#EF4444' }}>
      {children}
    </div>
  )
}

export function SkeletonBox({ height }) {
  return (
    <>
      <div style={{ height, borderRadius: radius.lg, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </>
  )
}

export function CenteredMessage({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem', textAlign: 'center', fontFamily: font.family }}>
      <div style={{ marginBottom: '1rem' }}>{icon}</div>
      <h2 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, marginBottom: '0.5rem' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: font.base, color: colors.muted, maxWidth: '380px' }}>{subtitle}</p>}
    </div>
  )
}

export function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '1rem' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: radius.md, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', color: iconColor }}>
        {icon}
      </div>
      <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, color: colors.dark, margin: 0 }}>{value}</p>
      <p style={{ fontSize: '12px', color: colors.muted, margin: '2px 0 0' }}>{label}</p>
    </div>
  )
}