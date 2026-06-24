'use client'

import { useState, useEffect } from 'react'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow } from '@/lib/styles'

const orderStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusStyles = {
  placed: { bg: '#EEF2FF', text: '#6366F1' },
  confirmed: { bg: '#EFF6FF', text: '#3B82F6' },
  processing: { bg: '#FEF3C7', text: '#D97706' },
  shipped: { bg: '#E0F2FE', text: '#0284C7' },
  delivered: { bg: '#DCFCE7', text: '#16A34A' },
  cancelled: { bg: '#FEE2E2', text: '#EF4444' },
}

export default function OrdersTab({ shopId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getShopOrders(shopId)
      setOrders(res.data.orders || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [shopId])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await ordersAPI.updateShopOrderStatus(orderId, { orderStatus: newStatus, shopId })
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '80px', borderRadius: radius.lg, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} />
        ))}
      </div>
    )
  }

  if (error) {
    return <p style={{ fontSize: font.base, color: colors.muted, textAlign: 'center', padding: '2rem 0' }}>{error}</p>
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ fontSize: font.base, color: colors.muted }}>No orders yet for your products.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {orders.map((order) => {
        const isExpanded = expandedId === order._id
        const statusStyle = statusStyles[order.orderStatus] || statusStyles.placed
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

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
                <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: statusStyle.bg, color: statusStyle.text, padding: '4px 10px', borderRadius: radius.full, whiteSpace: 'nowrap' }}>
                  {order.orderStatus}
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: colors.dark }}>${order.shopSubtotal.toFixed(2)}</span>
                <span style={{ color: colors.muted, fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {isExpanded && (
              <div style={{ borderTop: `1px solid ${colors.border}`, padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                  {order.shopItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: radius.md, backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                        {item.icon || '📦'}
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