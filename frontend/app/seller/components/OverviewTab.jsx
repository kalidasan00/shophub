'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, ShoppingBag, Package, AlertCircle, DollarSign } from 'lucide-react'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius } from '@/lib/styles'
import { StatCard, SkeletonBox } from './shared'

export default function OverviewTab({ shopId }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ordersAPI.getShopAnalytics(shopId)
        setAnalytics(res.data.analytics)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics')
      } finally { setLoading(false) }
    }
    fetch()
  }, [shopId])

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
      {[1,2,3,4].map((i) => <SkeletonBox key={i} height="90px" />)}
    </div>
  )

  if (error || !analytics) return (
    <p style={{ fontSize: font.base, color: colors.muted, textAlign: 'center', padding: '2rem 0' }}>{error || 'No data available'}</p>
  )

  const chartData  = analytics.revenueByDay.map((d) => ({
    date:    new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
  }))
  const alertCount = analytics.lowStockCount + analytics.outOfStockCount

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        <StatCard icon={<DollarSign size={16} strokeWidth={2} />}   iconBg="#DCFCE7"           iconColor="#16A34A"      label="Total Revenue"      value={`$${analytics.totalRevenue.toFixed(2)}`} />
        <StatCard icon={<ShoppingBag size={16} strokeWidth={2} />}  iconBg={colors.primaryLight} iconColor={colors.primary} label="Total Orders"    value={analytics.totalOrders} />
        <StatCard icon={<Package size={16} strokeWidth={2} />}      iconBg="#FEF3C7"           iconColor="#D97706"      label="Total Products"     value={analytics.totalProducts} />
        <StatCard
          icon={<AlertCircle size={16} strokeWidth={2} />}
          iconBg={alertCount > 0 ? '#FEE2E2' : colors.surface}
          iconColor={alertCount > 0 ? '#EF4444' : colors.muted}
          label="Low / Out of Stock"
          value={`${analytics.lowStockCount} / ${analytics.outOfStockCount}`}
        />
      </div>

      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <TrendingUp size={16} color={colors.primary} strokeWidth={2} />
          <h3 style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, margin: 0 }}>Revenue — Last 30 Days</h3>
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.muted }} interval={Math.floor(chartData.length / 6)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: colors.muted }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: `1px solid ${colors.border}` }} />
              <Bar dataKey="revenue" fill={colors.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.25rem' }}>
        <h3 style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, marginBottom: '1rem' }}>Top Selling Products</h3>
        {analytics.topProducts.length === 0
          ? <p style={{ fontSize: '13px', color: colors.muted }}>No sales yet.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analytics.topProducts.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.muted, width: '20px' }}>#{idx + 1}</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: radius.md, backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Package size={16} color={colors.muted} strokeWidth={1.5} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13.5px', fontWeight: 500, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '12px', color: colors.muted, margin: '1px 0 0' }}>{p.unitsSold} sold</p>
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: colors.dark, flexShrink: 0 }}>${p.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}