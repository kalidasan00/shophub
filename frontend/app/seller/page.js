'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Store, AlertTriangle, Loader, Package, Pencil, Trash2,
  ChevronDown, ChevronUp, Plus, X, Check, TrendingUp, ShoppingBag,
  AlertCircle, DollarSign,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { shopsAPI, productsAPI, ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

/* ── Constants ── */
const categories    = ['Fashion', 'Electronics', 'Food', 'Beauty', 'Sports', 'Books', 'Home', 'Toys', 'Other']
const productTags   = ['New', 'Sale', 'Popular', 'Top Rated', 'Trending', 'Fresh', '']
const orderStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusStyles = {
  placed:     { bg: '#EEF2FF', text: '#6366F1' },
  confirmed:  { bg: '#EFF6FF', text: '#3B82F6' },
  processing: { bg: '#FEF3C7', text: '#D97706' },
  shipped:    { bg: '#E0F2FE', text: '#0284C7' },
  delivered:  { bg: '#DCFCE7', text: '#16A34A' },
  cancelled:  { bg: '#FEE2E2', text: '#EF4444' },
}

const gradientPresets = [
  { label: 'Indigo Violet', from: '#6366F1', to: '#8B5CF6', direction: '135deg' },
  { label: 'Rose Sunset',   from: '#F43F5E', to: '#F97316', direction: '135deg' },
  { label: 'Ocean Blue',    from: '#0EA5E9', to: '#6366F1', direction: '135deg' },
  { label: 'Emerald',       from: '#10B981', to: '#0EA5E9', direction: '135deg' },
  { label: 'Peach',         from: '#F97316', to: '#FBBF24', direction: '135deg' },
  { label: 'Midnight',      from: '#1E1B4B', to: '#4C1D95', direction: '135deg' },
  { label: 'Pink Dream',    from: '#EC4899', to: '#A855F7', direction: '135deg' },
  { label: 'Slate Cool',    from: '#475569', to: '#0EA5E9', direction: '135deg' },
]

const directions = [
  { label: '→',  value: '90deg'  },
  { label: '↘',  value: '135deg' },
  { label: '↓',  value: '180deg' },
  { label: '↙',  value: '225deg' },
]

const DEFAULT_GRADIENT = { from: '#6366F1', to: '#8B5CF6', direction: '135deg' }

const inputStyle = {
  width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.md,
  padding: '11px 14px', fontSize: font.base, fontFamily: font.family,
  outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box',
}

const iconBtnStyle = {
  width: '32px', height: '32px', borderRadius: radius.md,
  border: `1px solid ${colors.border}`, backgroundColor: colors.white,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: colors.dark, transition: transition.fast,
}

/* ══════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════ */
export default function SellerDashboardPage() {
  const router  = useRouter()
  const user    = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [checking, setChecking] = useState(true)
  const [shop,     setShop]     = useState(null)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (user === null) { router.push('/auth/login?redirect=/seller'); return }
  }, [user])

  useEffect(() => {
    if (!user) return
    const checkShop = async () => {
      try {
        const res = await shopsAPI.getAll({ owner: user.id || user._id })
        setShop(res.data.shops?.[0] || null)
      } catch { setError('load-failed') }
      finally  { setChecking(false) }
    }
    checkShop()
  }, [user])

  if (!user) return null

  if (checking) return (
    <CenteredMessage icon={<Loader size={36} color={colors.muted} strokeWidth={1.5} />} title="Loading..." />
  )

  if (error === 'load-failed') return (
    <CenteredMessage
      icon={<AlertTriangle size={36} color={colors.muted} strokeWidth={1.5} />}
      title="Couldn't load your shop"
      subtitle="Please refresh and try again."
    />
  )

  if (!shop) return (
    <SellerOnboarding
      onCreated={(newShop) => {
        setShop(newShop)
        setUser({ ...user, role: 'shopowner' })
      }}
    />
  )

  return <SellerDashboard shop={shop} onShopUpdate={setShop} />
}

/* ── Centered Message ── */
function CenteredMessage({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem', textAlign: 'center', fontFamily: font.family }}>
      <div style={{ marginBottom: '1rem' }}>{icon}</div>
      <h2 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, marginBottom: '0.5rem' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: font.base, color: colors.muted, maxWidth: '380px' }}>{subtitle}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════════
   SELLER ONBOARDING
══════════════════════════════════════════════ */
function SellerOnboarding({ onCreated }) {
  const [step, setStep] = useState('landing')

  if (step === 'form') return <CreateShopForm onCreated={onCreated} onBack={() => setStep('landing')} />

  const perks = [
    { icon: <Store size={18} strokeWidth={1.5} />,     title: 'Your own storefront', desc: 'List products and manage your shop in minutes.' },
    { icon: <ShoppingBag size={18} strokeWidth={1.5} />, title: 'Instant orders',      desc: 'Get notified the moment a buyer places an order.' },
    { icon: <TrendingUp size={18} strokeWidth={1.5} />,  title: 'Sales analytics',     desc: 'Track revenue, top products and growth over time.' },
    { icon: <DollarSign size={18} strokeWidth={1.5} />,  title: 'Keep more earnings',  desc: 'Low platform fee. You set your own prices.' },
  ]

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1.5rem 5rem', fontFamily: font.family }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Store size={30} color={colors.primary} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: colors.dark, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Start selling on ShopHub
        </h1>
        <p style={{ fontSize: font.base, color: colors.muted, maxWidth: '380px', margin: '0 auto' }}>
          Join thousands of sellers. Set up your shop in under 2 minutes — no approval needed.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
        {perks.map((perk) => (
          <div key={perk.title} style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '1rem', boxShadow: shadow.card }}>
            <div style={{ width: '34px', height: '34px', borderRadius: radius.md, backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, marginBottom: '10px' }}>
              {perk.icon}
            </div>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: colors.dark, margin: '0 0 4px' }}>{perk.title}</p>
            <p style={{ fontSize: '12.5px', color: colors.muted, margin: 0, lineHeight: 1.5 }}>{perk.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setStep('form')}
        style={{ width: '100%', padding: '14px', backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, fontSize: font.md, fontWeight: 700, fontFamily: font.family, cursor: 'pointer', letterSpacing: '0.01em' }}
      >
        Set up my shop →
      </button>
      <p style={{ textAlign: 'center', fontSize: font.xs, color: colors.muted, marginTop: '0.75rem' }}>
        Free to start · No credit card required
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════
   CREATE SHOP FORM
══════════════════════════════════════════════ */
function CreateShopForm({ onCreated, onBack }) {
  const [form,       setForm]       = useState({ name: '', description: '', category: 'Fashion' })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim()) { setError('Please fill in shop name and description'); return }
    setSubmitting(true); setError(null)
    try {
      const res = await shopsAPI.create(form)
      onCreated(res.data.shop)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shop')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, fontSize: font.sm, fontFamily: font.family, marginBottom: '1.5rem', padding: 0 }}>
        <ChevronDown size={14} style={{ transform: 'rotate(90deg)' }} strokeWidth={2} /> Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 800, color: colors.dark, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
          Set up your shop
        </h1>
        <p style={{ fontSize: font.base, color: colors.muted }}>You can edit everything later from settings.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.75rem', boxShadow: shadow.card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Field label="Shop name">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Urban Threads" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e)  => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="What do you sell?">
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your shop and products..." rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e)  => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="Category">
          <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        {error && <ErrorBox>{error}</ErrorBox>}

        <button type="submit" disabled={submitting} style={{ backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '13px', fontSize: font.md, fontWeight: 700, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Creating your shop...' : 'Create Shop'}
        </button>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SELLER DASHBOARD SHELL
══════════════════════════════════════════════ */
function SellerDashboard({ shop, onShopUpdate }) {
  const [activeTab, setActiveTab] = useState('overview')

  const g           = shop.gradient || DEFAULT_GRADIENT
  const gradientCSS = `linear-gradient(${g.direction}, ${g.from}, ${g.to})`

  const tabs = [
    { key: 'overview', label: 'Overview'  },
    { key: 'orders',   label: 'Orders'    },
    { key: 'products', label: 'Products'  },
    { key: 'settings', label: 'Settings'  },
  ]

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${g.from}22 0%, transparent 320px)`, fontFamily: font.family }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem 5rem' }}>

        {/* Shop header — gradient banner */}
        <div style={{
          background: gradientCSS,
          borderRadius: radius.xxl,
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          boxShadow: shadow.card,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{ width: '52px', height: '52px', minWidth: '52px', borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={24} color="#fff" strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#fff', margin: 0 }}>{shop.name}</h1>
            <p style={{ fontSize: font.sm, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>Seller Dashboard · {shop.category}</p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, marginBottom: '1.5rem', overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 0', marginRight: '1.5rem', border: 'none',
                borderBottom: activeTab === tab.key ? `2px solid ${colors.primary}` : '2px solid transparent',
                backgroundColor: 'transparent', cursor: 'pointer',
                fontSize: font.base, fontWeight: 600, fontFamily: font.family,
                color: activeTab === tab.key ? colors.primary : colors.muted,
                transition: transition.fast, whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >{tab.label}</button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab shopId={shop._id} />}
        {activeTab === 'orders'   && <OrdersTab   shopId={shop._id} />}
        {activeTab === 'products' && <ProductsTab  shopId={shop._id} />}
        {activeTab === 'settings' && <ShopSettingsTab shop={shop} onShopUpdate={onShopUpdate} />}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   OVERVIEW TAB
══════════════════════════════════════════════ */
function OverviewTab({ shopId }) {
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
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

      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.25rem', marginBottom: '1.5rem', boxShadow: shadow.card }}>
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

      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.25rem', boxShadow: shadow.card }}>
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

function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '1rem', boxShadow: shadow.card }}>
      <div style={{ width: '32px', height: '32px', borderRadius: radius.md, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', color: iconColor }}>
        {icon}
      </div>
      <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, color: colors.dark, margin: 0 }}>{value}</p>
      <p style={{ fontSize: '12px', color: colors.muted, margin: '2px 0 0' }}>{label}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ORDERS TAB
══════════════════════════════════════════════ */
function OrdersTab({ shopId }) {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [expandedId,  setExpandedId]  = useState(null)
  const [updatingId,  setUpdatingId]  = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ordersAPI.getShopOrders(shopId)
        setOrders(res.data.orders || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally { setLoading(false) }
    }
    fetch()
  }, [shopId])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await ordersAPI.updateShopOrderStatus(orderId, { orderStatus: newStatus, shopId })
      setOrders(orders.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    } finally { setUpdatingId(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1,2,3].map((i) => <SkeletonBox key={i} height="80px" />)}
    </div>
  )

  if (error) return <p style={{ fontSize: font.base, color: colors.muted, textAlign: 'center', padding: '2rem 0' }}>{error}</p>

  if (orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <ShoppingBag size={40} color={colors.muted} strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: font.base, color: colors.muted }}>No orders yet for your products.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {orders.map((order) => {
        const isExpanded = expandedId === order._id
        const ss         = statusStyles[order.orderStatus] || statusStyles.placed
        const orderDate  = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

        return (
          <div key={order._id} style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, boxShadow: shadow.card, overflow: 'hidden' }}>
            <button
              onClick={() => setExpandedId(isExpanded ? null : order._id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: font.family }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '13.5px', fontWeight: 600, color: colors.dark, margin: 0 }}>
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p style={{ fontSize: '12px', color: colors.muted, margin: '2px 0 0' }}>
                  {order.user?.name} · {orderDate} · {order.shopItems.length} item{order.shopItems.length > 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: ss.bg, color: ss.text, padding: '4px 10px', borderRadius: radius.full, whiteSpace: 'nowrap' }}>
                  {order.orderStatus}
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: colors.dark }}>${order.shopSubtotal.toFixed(2)}</span>
                {isExpanded
                  ? <ChevronUp size={16} color={colors.muted} strokeWidth={2} />
                  : <ChevronDown size={16} color={colors.muted} strokeWidth={2} />
                }
              </div>
            </button>

            {isExpanded && (
              <div style={{ borderTop: `1px solid ${colors.border}`, padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                  {order.shopItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: radius.md, backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {item.images?.[0]
                          ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={16} color={colors.muted} strokeWidth={1.5} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ fontSize: '11.5px', color: colors.muted, margin: '1px 0 0' }}>Qty: {item.quantity}</p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: colors.dark, flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '0.75rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: colors.muted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Shipping</p>
                  <p style={{ fontSize: '12.5px', color: colors.dark, margin: 0, lineHeight: 1.5 }}>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 500, color: colors.dark, whiteSpace: 'nowrap' }}>Update status:</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '7px 10px', fontSize: '13px', fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, cursor: 'pointer' }}
                  >
                    {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════
   PRODUCTS TAB
══════════════════════════════════════════════ */
function ProductsTab({ shopId }) {
  const [products,       setProducts]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [showForm,       setShowForm]       = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getByShop(shopId)
      setProducts(res.data.products || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [shopId])

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await productsAPI.delete(productId)
      setProducts(products.filter((p) => p._id !== productId))
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete') }
  }

  const handleFormClose = () => { setShowForm(false); setEditingProduct(null) }
  const handleFormSaved = () => { handleFormClose(); fetchProducts() }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ fontSize: font.base, color: colors.muted, margin: 0 }}>{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '9px 16px', fontSize: font.base, fontWeight: 600, fontFamily: font.family, cursor: 'pointer' }}
        >
          <Plus size={15} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm shopId={shopId} existingProduct={editingProduct} onClose={handleFormClose} onSaved={handleFormSaved} />
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map((i) => <SkeletonBox key={i} height="76px" />)}
        </div>
      )}

      {!loading && error && <p style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.muted, fontSize: font.base }}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Package size={40} color={colors.muted} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: font.base, color: colors.muted }}>No products yet. Add your first one.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {products.map((product) => (
            <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '0.875rem 1rem', boxShadow: shadow.card }}>
              <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: radius.md, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Package size={20} color={colors.muted} strokeWidth={1.5} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>${product.price} · Stock: {product.stock} · {product.tag || 'No tag'}</p>
              </div>
              <span style={{ fontSize: font.xs, fontWeight: 600, flexShrink: 0, padding: '4px 10px', borderRadius: radius.full, backgroundColor: product.stock > 0 ? '#DCFCE7' : '#FEE2E2', color: product.stock > 0 ? '#16A34A' : '#EF4444' }}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => { setEditingProduct(product); setShowForm(true) }} style={iconBtnStyle} title="Edit">
                  <Pencil size={15} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(product._id)} style={iconBtnStyle} title="Delete"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.dark}>
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Product Form ── */
function ProductForm({ shopId, existingProduct, onClose, onSaved }) {
  const isEditing = !!existingProduct
  const [form, setForm] = useState({
    name:          existingProduct?.name          || '',
    description:   existingProduct?.description   || '',
    price:         existingProduct?.price         || '',
    originalPrice: existingProduct?.originalPrice || '',
    category:      existingProduct?.category      || categories[0],
    stock:         existingProduct?.stock         ?? '',
    tag:           existingProduct?.tag           || 'New',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim() || !form.price || form.stock === '') {
      setError('Please fill in name, description, price, and stock'); return
    }
    setSubmitting(true); setError(null)
    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock:         Number(form.stock),
      shop:          shopId,
    }
    try {
      isEditing ? await productsAPI.update(existingProduct._id, payload) : await productsAPI.create(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.5rem', boxShadow: shadow.card, marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, margin: 0 }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, padding: '4px', display: 'flex' }}>
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Product name"><input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic White Tee" style={inputStyle} /></Field>
        <Field label="Description"><textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }} /></Field>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <Field label="Price ($)"><input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" style={inputStyle} /></Field>
          <Field label="Original price"><input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} min="0" step="0.01" style={inputStyle} /></Field>
          <Field label="Stock"><input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" style={inputStyle} /></Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <Field label="Category">
            <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Tag">
            <select name="tag" value={form.tag} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
              {productTags.map((t) => <option key={t} value={t}>{t || 'None'}</option>)}
            </select>
          </Field>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={submitting} style={{ flex: 1, backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '12px', fontSize: font.base, fontWeight: 600, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
          </button>
          <button type="button" onClick={onClose} style={{ padding: '12px 20px', border: `1px solid ${colors.border}`, borderRadius: radius.md, backgroundColor: colors.white, color: colors.dark, fontSize: font.base, fontWeight: 500, fontFamily: font.family, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SHOP SETTINGS TAB
══════════════════════════════════════════════ */
function ShopSettingsTab({ shop, onShopUpdate }) {
  const [form,       setForm]       = useState({ name: shop.name, description: shop.description, category: shop.category })
  const [gradient,   setGradient]   = useState(shop.gradient || DEFAULT_GRADIENT)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [saved,      setSaved]      = useState(false)

  const handleChange   = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setSaved(false) }
  const handleGradient = (key, value) => { setGradient({ ...gradient, [key]: value }); setSaved(false) }
  const applyPreset    = (preset) => { setGradient({ from: preset.from, to: preset.to, direction: preset.direction }); setSaved(false) }

  const previewCSS = `linear-gradient(${gradient.direction}, ${gradient.from}, ${gradient.to})`

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError(null)
    try {
      const res = await shopsAPI.update(shop._id, { ...form, gradient })
      onShopUpdate(res.data.shop); setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shop')
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Basic Info ── */}
      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.75rem', boxShadow: shadow.card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: font.base, fontWeight: 700, color: colors.dark, margin: 0 }}>Basic Info</h3>
        <Field label="Shop name">
          <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Description">
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: font.family }} />
        </Field>
        <Field label="Category">
          <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* ── Appearance ── */}
      <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.xxl, padding: '1.75rem', boxShadow: shadow.card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: font.base, fontWeight: 700, color: colors.dark, margin: 0 }}>Shop Appearance</h3>

        {/* Live preview */}
        <div style={{ borderRadius: radius.lg, overflow: 'hidden', height: '76px', background: previewCSS, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} color="#fff" strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>{form.name || shop.name}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>Preview</p>
          </div>
        </div>

        {/* Preset swatches */}
        <div>
          <p style={{ fontSize: '11.5px', fontWeight: 600, color: colors.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {gradientPresets.map((preset) => {
              const isActive = gradient.from === preset.from && gradient.to === preset.to
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  title={preset.label}
                  style={{
                    height: '38px',
                    borderRadius: radius.md,
                    background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                    border: isActive ? `2px solid ${colors.dark}` : '2px solid transparent',
                    cursor: 'pointer',
                    outline: isActive ? '2px solid white' : 'none',
                    outlineOffset: '-4px',
                    transition: transition.fast,
                  }}
                />
              )
            })}
          </div>
          {/* Preset labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '4px' }}>
            {gradientPresets.map((preset) => (
              <p key={preset.label} style={{ fontSize: '10px', color: colors.muted, margin: 0, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {preset.label}
              </p>
            ))}
          </div>
        </div>

        {/* Custom color pickers */}
        <div>
          <p style={{ fontSize: '11.5px', fontWeight: 600, color: colors.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom Colors</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="From">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '8px 12px', backgroundColor: colors.white }}>
                <input
                  type="color"
                  value={gradient.from}
                  onChange={(e) => handleGradient('from', e.target.value)}
                  style={{ width: '28px', height: '28px', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '4px', background: 'none' }}
                />
                <span style={{ fontSize: '12.5px', color: colors.dark, fontFamily: 'monospace' }}>{gradient.from}</span>
              </div>
            </Field>
            <Field label="To">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '8px 12px', backgroundColor: colors.white }}>
                <input
                  type="color"
                  value={gradient.to}
                  onChange={(e) => handleGradient('to', e.target.value)}
                  style={{ width: '28px', height: '28px', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '4px', background: 'none' }}
                />
                <span style={{ fontSize: '12.5px', color: colors.dark, fontFamily: 'monospace' }}>{gradient.to}</span>
              </div>
            </Field>
          </div>
        </div>

        {/* Direction picker */}
        <div>
          <p style={{ fontSize: '11.5px', fontWeight: 600, color: colors.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direction</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {directions.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => handleGradient('direction', d.value)}
                style={{
                  width: '42px', height: '42px',
                  borderRadius: radius.md,
                  border: gradient.direction === d.value ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                  backgroundColor: gradient.direction === d.value ? colors.primaryLight : colors.white,
                  color: gradient.direction === d.value ? colors.primary : colors.muted,
                  fontSize: '18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: transition.fast,
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      {error && <ErrorBox>{error}</ErrorBox>}
      {saved && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={14} strokeWidth={2.5} /> Shop settings saved
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{ backgroundColor: submitting ? '#A5B4FC' : colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '13px', fontSize: font.md, fontWeight: 600, fontFamily: font.family, cursor: submitting ? 'not-allowed' : 'pointer' }}
      >
        {submitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════════════
   SHARED HELPERS
══════════════════════════════════════════════ */
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: colors.dark, marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  )
}

function ErrorBox({ children }) {
  return (
    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.md, padding: '10px 14px', fontSize: font.sm, color: '#EF4444' }}>
      {children}
    </div>
  )
}

function SkeletonBox({ height }) {
  return (
    <>
      <div style={{ height, borderRadius: radius.lg, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </>
  )
}