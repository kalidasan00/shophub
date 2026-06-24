'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, Package, ChevronDown } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const statusStyles = {
  placed:     { bg: '#EEF2FF', text: '#6366F1', label: 'Placed' },
  confirmed:  { bg: '#EFF6FF', text: '#3B82F6', label: 'Confirmed' },
  processing: { bg: '#FEF3C7', text: '#D97706', label: 'Processing' },
  shipped:    { bg: '#E0F2FE', text: '#0284C7', label: 'Shipped' },
  delivered:  { bg: '#DCFCE7', text: '#16A34A', label: 'Delivered' },
  cancelled:  { bg: '#FEE2E2', text: '#EF4444', label: 'Cancelled' },
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '120px', borderRadius: radius.xxl, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} />
        ))}
      </div>
    </div>
  )
}

function OrdersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const justPlaced = searchParams.get('success') === '1'

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/orders'); return }
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getMyOrders()
        setOrders(res.data.orders || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  if (!user) return null

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: colors.dark, marginBottom: '6px' }}>My Orders</h1>
        <p style={{ fontSize: font.base, color: colors.muted }}>Track and view your order history</p>
      </div>

      {/* Success banner */}
      {justPlaced && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: radius.lg, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} color="#16A34A" strokeWidth={2} />
          <div>
            <p style={{ fontSize: font.base, fontWeight: 600, color: '#16A34A', margin: 0 }}>Order placed successfully!</p>
            <p style={{ fontSize: font.sm, color: '#15803D', margin: 0 }}>You'll receive updates as your order progresses.</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '120px', borderRadius: radius.xxl, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <AlertTriangle size={40} color={colors.muted} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontWeight: 600, fontSize: '1rem', color: colors.dark, marginBottom: '0.375rem' }}>Couldn't load your orders</h3>
          <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '1.25rem' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: radius.md, padding: '10px 20px', fontSize: font.base, fontWeight: 500, fontFamily: font.family, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Package size={48} color={colors.muted} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontWeight: 600, fontSize: '1.125rem', color: colors.dark, marginBottom: '0.5rem' }}>No orders yet</h3>
          <p style={{ fontSize: font.base, color: colors.muted, marginBottom: '1.5rem' }}>When you place an order, it'll show up here.</p>
          <Link href="/shops" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: colors.dark, color: colors.white, textDecoration: 'none', padding: '12px 24px', borderRadius: radius.md, fontSize: font.base, fontWeight: 500 }}>
            Browse Shops
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              expanded={expandedId === order._id}
              onToggle={() => setExpandedId(expandedId === order._id ? null : order._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, expanded, onToggle }) {
  const status = statusStyles[order.orderStatus] || statusStyles.placed
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const previewItems = order.items.slice(0, 3)
  const extraCount = order.items.length - previewItems.length

  return (
    <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, boxShadow: shadow.card, overflow: 'hidden' }}>

      {/* Header row */}
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: font.family }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>

          {/* Item preview */}
          <div style={{ display: 'flex', flexShrink: 0 }}>
            {previewItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  width: '40px', height: '40px',
                  backgroundColor: colors.surface, border: `2px solid ${colors.white}`,
                  borderRadius: radius.md, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: idx === 0 ? 0 : '-12px',
                  position: 'relative', zIndex: previewItems.length - idx,
                }}
              >
                {item.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Package size={18} color={colors.muted} strokeWidth={1.5} />
                }
              </div>
            ))}
            {extraCount > 0 && (
              <div style={{ width: '40px', height: '40px', backgroundColor: colors.surface, border: `2px solid ${colors.white}`, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: font.xs, fontWeight: 600, color: colors.muted, marginLeft: '-12px' }}>
                +{extraCount}
              </div>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, margin: 0 }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
            <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>
              {orderDate} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: font.xs, fontWeight: 600, backgroundColor: status.bg, color: status.text, padding: '5px 12px', borderRadius: radius.full, whiteSpace: 'nowrap' }}>
            {status.label}
          </span>
          <span style={{ fontSize: font.md, fontWeight: 700, color: colors.dark, whiteSpace: 'nowrap' }}>
            ${order.total.toFixed(2)}
          </span>
          <ChevronDown
            size={18} color={colors.muted} strokeWidth={2}
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: transition.fast, flexShrink: 0 }}
          />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${colors.border}`, padding: '1.25rem' }}>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', minWidth: '44px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Package size={20} color={colors.muted} strokeWidth={1.5} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: font.base, fontWeight: 500, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>
                    Qty: {item.quantity}
                    {item.size  && ` · Size: ${item.size}`}
                    {item.color && ` · Color: ${item.color}`}
                  </p>
                </div>
                <span style={{ fontSize: font.base, fontWeight: 600, color: colors.dark }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          <div style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: font.xs, fontWeight: 600, color: colors.muted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Shipping Address</p>
            <p style={{ fontSize: font.sm, color: colors.dark, margin: 0, lineHeight: 1.5 }}>
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
            </p>
          </div>

          {/* Price breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: font.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>Subtotal</span>
              <span style={{ color: colors.dark }}>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                <span>−${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>Shipping</span>
              <span style={{ color: order.shippingCost === 0 ? '#16A34A' : colors.dark }}>
                {order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${colors.border}`, fontWeight: 700, fontSize: font.base }}>
              <span style={{ color: colors.dark }}>Total</span>
              <span style={{ color: colors.dark }}>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment info */}
          <p style={{ fontSize: font.xs, color: colors.muted, marginTop: '1rem', marginBottom: 0 }}>
            Payment method: <span style={{ fontWeight: 600, color: colors.dark, textTransform: 'uppercase' }}>{order.paymentMethod}</span>
            {' · '}
            Payment status: <span style={{ fontWeight: 600, color: order.paymentStatus === 'paid' ? '#16A34A' : colors.muted }}>{order.paymentStatus}</span>
          </p>
        </div>
      )}
    </div>
  )
}