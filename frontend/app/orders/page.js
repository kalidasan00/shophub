'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Package, ChevronRight } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const statusStyles = {
  placed:     { bg: '#EEF2FF', text: '#6366F1', label: 'Placed'     },
  confirmed:  { bg: '#EFF6FF', text: '#3B82F6', label: 'Confirmed'  },
  processing: { bg: '#FEF3C7', text: '#D97706', label: 'Processing' },
  shipped:    { bg: '#E0F2FE', text: '#0284C7', label: 'Shipped'    },
  delivered:  { bg: '#DCFCE7', text: '#16A34A', label: 'Delivered'  },
  cancelled:  { bg: '#FEE2E2', text: '#EF4444', label: 'Cancelled'  },
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersPageFallback />}>
      <OrdersPageContent />
    </Suspense>
  )
}

function OrdersPageFallback() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '80px', borderRadius: radius.xxl, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} />
        ))}
      </div>
    </div>
  )
}

function OrdersPageContent() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/orders'); return }
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getMyOrders()
        setOrders(res.data.orders || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally { setLoading(false) }
    }
    fetchOrders()
  }, [user])

  if (!user) return null

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 1.25rem 5rem', fontFamily: font.family }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 800, color: colors.dark, marginBottom: '4px', letterSpacing: '-0.02em' }}>My Orders</h1>
        <p style={{ fontSize: font.base, color: colors.muted, margin: 0 }}>Track and view your order history</p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '80px', borderRadius: radius.xxl, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <AlertTriangle size={40} color={colors.muted} strokeWidth={1.5} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontWeight: 600, fontSize: '1rem', color: colors.dark, marginBottom: '0.375rem' }}>Couldn't load your orders</h3>
          <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '1.25rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '10px 20px', fontSize: font.base, fontWeight: 500, fontFamily: font.family, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Package size={48} color={colors.muted} strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, fontSize: '1.125rem', color: colors.dark, marginBottom: '0.5rem' }}>No orders yet</h3>
          <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '1.5rem' }}>When you place an order, it'll show up here.</p>
          <Link href="/shops" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: colors.dark, color: colors.white, textDecoration: 'none', padding: '12px 24px', borderRadius: radius.md, fontSize: font.base, fontWeight: 500 }}>
            Browse Shops
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderRow({ order }) {
  const status = statusStyles[order.orderStatus] || statusStyles.placed
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const previewItems = order.items.slice(0, 3)
  const extraCount = order.items.length - previewItems.length

  return (
    <Link href={`/orders/${order._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, boxShadow: shadow.card, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: transition.base, cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary + '44'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border}
      >
        {/* Item image previews */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
          {previewItems.map((item, idx) => (
            <div key={idx} style={{ width: '40px', height: '40px', backgroundColor: colors.surface, border: `2px solid ${colors.white}`, borderRadius: radius.md, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: idx === 0 ? 0 : '-10px', position: 'relative', zIndex: previewItems.length - idx }}>
              {item.images?.[0]
                ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Package size={16} color={colors.muted} strokeWidth={1.5} />
              }
            </div>
          ))}
          {extraCount > 0 && (
            <div style={{ width: '40px', height: '40px', backgroundColor: colors.surface, border: `2px solid ${colors.white}`, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: colors.muted, marginLeft: '-10px' }}>
              +{extraCount}
            </div>
          )}
        </div>

        {/* Order info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, margin: 0 }}>
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>
            {orderDate} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Status + price + arrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: status.bg, color: status.text, padding: '4px 10px', borderRadius: radius.full, whiteSpace: 'nowrap' }}>
            {status.label}
          </span>
          <span style={{ fontSize: font.base, fontWeight: 700, color: colors.dark, whiteSpace: 'nowrap' }}>
            ${order.total.toFixed(2)}
          </span>
          <ChevronRight size={16} color={colors.muted} strokeWidth={2} />
        </div>
      </div>
    </Link>
  )
}