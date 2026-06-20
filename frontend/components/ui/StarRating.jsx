import { colors, font } from '@/lib/styles'

export default function StarRating({ rating, reviews, size = 'sm' }) {
  const starSize = size === 'sm' ? 13 : 16

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={starSize}
          height={starSize}
          viewBox="0 0 24 24"
          style={{ color: star <= Math.floor(rating) ? colors.yellow : colors.border, fill: star <= Math.floor(rating) ? colors.yellow : colors.border }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: font.sm, fontWeight: '600', color: colors.dark, fontFamily: font.family }}>
        {rating}
      </span>
      {reviews && (
        <span style={{ fontSize: font.sm, color: colors.muted, fontFamily: font.family }}>
          ({reviews})
        </span>
      )}
    </div>
  )
}