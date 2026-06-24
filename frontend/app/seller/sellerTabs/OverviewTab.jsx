'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow } from '@/lib/styles'

export default function OverviewTab({ shopId }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await ordersAPI.getShopAnalytics(shopId)
        setAnalytics(res.data.analytics)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [shopId])

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: '90px', borderRadius: radius.lg, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} />
        ))}
      </div>
    )
  }

  if (error || !analytics) {
    return <p style={{ fontSize: font.base, color: colors.muted, textAlign: 'center', padding: '2rem 0' }}>{error || 'No data available'}</p>
  }

  const chartData = analytics.revenueByDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
  }))

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        <StatCard iconBg="#DCFCE7" iconColor="#16A34A" label="Total Revenue" value={`$${analytics.totalRevenue.toFixed(2)}`} symbol="$" />
        <StatCard iconBg={colors.primaryLight} iconColor={colors.primary} label="Total Orders" value={analytics.totalOrders} symbol="🛒" />
        <StatCard iconBg="#FEF3C7" iconColor="#D97706" label="Total Products" value={analytics.totalProducts} symbol="📦" />
        <StatCard
          iconBg={analytics.lowStockCount + analytics.outOfStockCount > 0 ? '#FEE2E2' : colors.surface}
          iconColor={analytics.lowStockCount + analytics.outOfStockCount > 0 ? '#EF4444' : colors.muted}
          label="Low / Out of Stock"
          value={`${analytics.lowStockCount} / ${analytics.outOfStockCount}`}
          symbol="⚠"
        />
      </div>

      {/* Revenue chart */}
      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.25rem', marginBottom: '1.5rem', boxShadow: shadow.card }}>
        <h3 style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, marginBottom: '1rem' }}>Revenue — Last 30 Days</h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.muted }} interval={Math.floor(chartData.length / 6)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: colors.muted }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: `1px solid ${colors.border}` }}
              />
              <Bar dataKey="revenue" fill={colors.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.25rem', boxShadow: shadow.card }}>
        <h3 style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, marginBottom: '1rem' }}>Top Selling Products</h3>
        {analytics.topProducts.length === 0 ? (
          <p style={{ fontSize: '13px', color: colors.muted }}>No sales yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analytics.topProducts.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: colors.muted, width: '20px' }}>#{idx + 1}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: radius.md, backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {p.icon || '📦'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13.5px', fontWeight: 500, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '12px', color: colors.muted, margin: '1px 0 0' }}>{p.unitsSold} sold</p>
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: colors.dark, flexShrink: 0 }}>${p.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ iconBg, iconColor, label, value, symbol }) {
  return (
    <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '1rem', boxShadow: shadow.card }}>
      <div style={{ width: '32px', height: '32px', borderRadius: radius.md, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '14px', color: iconColor }}>
        {symbol}
      </div>
      <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, color: colors.dark, margin: 0 }}>{value}</p>
      <p style={{ fontSize: '12px', color: colors.muted, margin: '2px 0 0' }}>{label}</p>
    </div>
  )
}