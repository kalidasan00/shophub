'use client'

import { useState, useEffect, useMemo } from 'react'
import { Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius } from '@/lib/styles'
import { orderStatuses, statusStyles, SkeletonBox } from './shared'

export default function OrdersTab({ shopId }) {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [expandedId,  setExpandedId]  = useState(null)
  const [updatingId,  setUpdatingId]  = useState(null)
  const [filter,      setFilter]      = useState('all')

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

  const counts = useMemo(() => {
    const c = { all: orders.length }
    orderStatuses.forEach((s) => { c[s] = orders.filter((o) => o.orderStatus === s).length })
    return c
  }, [orders])

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter)

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

  const filterOptions = ['all', ...orderStatuses]

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '2px' }}>
        {filterOptions.map((s) => {
          const active = filter === s
          const label  = s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                flexShrink: 0,
                fontSize: '12.5px',
                fontWeight: 600,
                padding: '7px 14px',
                borderRadius: radius.full,
                border: active ? 'none' : `1px solid ${colors.border}`,
                backgroundColor: active ? colors.primary : colors.white,
                color: active ? colors.white : colors.muted,
                cursor: 'pointer',
                fontFamily: font.family,
                whiteSpace: 'nowrap',
              }}
            >
              {label} ({counts[s] || 0})
            </button>
          )
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <p style={{ fontSize: font.base, color: colors.muted, textAlign: 'center', padding: '2rem 0' }}>No orders with this status.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredOrders.map((order) => {
            const isExpanded  = expandedId === order._id
            const ss          = statusStyles[order.orderStatus] || statusStyles.placed
            const orderDate   = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            const firstItem   = order.shopItems[0]
            const extraCount  = order.shopItems.length - 1

            return (
              <div key={order._id} style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: font.family }}
                >
                  <div style={{ width: '38px', height: '38px', minWidth: '38px', borderRadius: radius.md, backgroundColor: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {firstItem?.images?.[0]
                      ? <img src={firstItem.images[0]} alt={firstItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Package size={16} color={colors.muted} strokeWidth={1.5} />
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: colors.dark, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {firstItem?.name}{extraCount > 0 ? ` +${extraCount} more` : ''}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.muted, margin: '2px 0 0' }}>
                      #{order._id.slice(-8).toUpperCase()} · {orderDate}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: colors.dark, margin: 0 }}>${order.shopSubtotal.toFixed(2)}</p>
                    <span style={{ fontSize: '10px', fontWeight: 600, backgroundColor: ss.bg, color: ss.text, padding: '2px 8px', borderRadius: radius.full, whiteSpace: 'nowrap' }}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {isExpanded
                    ? <ChevronUp size={15} color={colors.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
                    : <ChevronDown size={15} color={colors.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
                  }
                </button>

                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${colors.border}`, padding: '1rem' }}>
                    <p style={{ fontSize: '12px', color: colors.muted, margin: '0 0 8px' }}>{order.user?.name}</p>

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
      )}
    </div>
  )
}