import { colors, radius, font } from '@/lib/styles'

const variants = {
  primary: { backgroundColor: colors.primaryLight, color: colors.primary },
  success: { backgroundColor: '#DCFCE7', color: '#16A34A' },
  warning: { backgroundColor: '#FEF9C3', color: '#CA8A04' },
  danger: { backgroundColor: '#FEF2F2', color: colors.red },
  gray: { backgroundColor: colors.surface, color: colors.muted, border: `1px solid ${colors.border}` },
}

export default function Badge({ label, variant = 'primary', style = {} }) {
  return (
    <span style={{
      fontSize: font.xs,
      fontWeight: '600',
      padding: '4px 10px',
      borderRadius: radius.full,
      fontFamily: font.family,
      whiteSpace: 'nowrap',
      display: 'inline-block',
      ...variants[variant],
      ...style,
    }}>
      {label}
    </span>
  )
}