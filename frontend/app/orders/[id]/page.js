'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import {
  CheckCircle2, Package, MapPin, CreditCard,
  ArrowRight, ShoppingBag, AlertTriangle, ChevronDown,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const statusStyles = {
  placed:     { bg: '#EEF2FF', text: '#6366F1', label: 'Order Placed'  },
  confirmed:  { bg: '#EFF6FF', text: '#3B82F6', label: 'Confirmed'     },
  processing: { bg: '#FEF3C7', text: '#D97706', label: 'Processing'    },
  shipped:    { bg: '#E0F2FE', text: '#0284C7', label: 'Shipped'       },
  delivered:  { bg: '#DCFCE7', text: '#16A34A', label: 'Delivered'     },
  cancelled:  { bg: '#FEE2E2', text: '#EF4444', label: 'Cancelled'     },
}

const steps = ['placed', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage({ params }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  )
}

function OrderDetailContent({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isSuccess = searchParams.get('success') === '1'

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    const fetch = async () => {
      try {
        const res = await ordersAPI.getOne(id)
        setOrder(res.data.order)
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found')
      } finally { setLoading(false) }
    }
    fetch()
  }, [user, id])

  if (!user) return null
  if (loading) return <PageSkeleton />

  if (error) return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 1.25rem', textAlign: 'center', fontFamily: font.family }}>
      <AlertTriangle size={40} color={colors.muted} strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
      <h2 style={{ fontSize: font.lg, fontWeight: 700, color: colors.dark, marginBottom: '8px' }}>Order not found</h2>
      <p style={{ color: colors.muted, marginBottom: '1.5rem' }}>{error}</p>
      <Link href="/orders" style={{ color: colors.primary, textDecoration: 'none', fontWeight: 600 }}>View all orders</Link>
    </div>
  )

  const status = statusStyles[order.orderStatus] || statusStyles.placed
  const stepIndex = steps.indexOf(order.orderStatus)
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const isCancelled = order.orderStatus === 'cancelled'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1.25rem 5rem' }}>

        {/* ── Success hero (only on ?success=1) ── */}
        {isSuccess && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem 1.5rem', marginBottom: '1.25rem', backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid #BBF7D0`, boxShadow: shadow.card }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={32} color="#16A34A" strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 800, color: colors.dark, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Order confirmed!
            </h1>
            <p style={{ fontSize: font.base, color: colors.muted, margin: '0 0 1.25rem' }}>
              Thanks for your order. We'll send updates as it progresses.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: radius.full, padding: '5px 14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', letterSpacing: '0.05em' }}>
                ORDER #{order._id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* ── Order header (non-success) ── */}
        {!isSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, color: colors.dark, margin: 0, letterSpacing: '-0.02em' }}>
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p style={{ fontSize: font.sm, color: colors.muted, margin: '3px 0 0' }}>{orderDate}</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: status.bg, color: status.text, padding: '5px 14px', borderRadius: radius.full }}>
              {status.label}
            </span>
          </div>
        )}

        {/* ── Progress tracker ── */}
        {!isCancelled && (
          <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.25rem', marginBottom: '1rem', boxShadow: shadow.card }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>Order Progress</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {steps.map((step, idx) => {
                const done = stepIndex >= idx
                const active = stepIndex === idx
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 0 }}>
                    {/* Circle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <div style={{
                        width: active ? '28px' : '22px',
                        height: active ? '28px' : '22px',
                        borderRadius: '50%',
                        backgroundColor: done ? colors.primary : colors.surface,
                        border: `2px solid ${done ? colors.primary : colors.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: transition.base,
                        boxShadow: active ? `0 0 0 3px ${colors.primaryLight}` : 'none',
                      }}>
                        {done && <CheckCircle2 size={12} color="#fff" strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500, color: done ? colors.primary : colors.muted, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                        {step}
                      </span>
                    </div>
                    {/* Line */}
                    {idx < steps.length - 1 && (
                      <div style={{ flex: 1, height: '2px', backgroundColor: stepIndex > idx ? colors.primary : colors.border, margin: '0 4px', marginBottom: '18px', transition: transition.base }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.lg, padding: '12px 16px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#EF4444" strokeWidth={2} />
            <p style={{ fontSize: font.sm, fontWeight: 600, color: '#EF4444', margin: 0 }}>This order has been cancelled.</p>
          </div>
        )}

        {/* ── Order items ── */}
        <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.25rem', marginBottom: '1rem', boxShadow: shadow.card }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Package size={15} color={colors.muted} strokeWidth={2} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Items ({order.items.length})
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: radius.md, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Package size={20} color={colors.muted} strokeWidth={1.5} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: font.base, fontWeight: 600, color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontSize: font.sm, color: colors.muted, margin: '2px 0 0' }}>
                    Qty: {item.quantity}
                    {item.size  && ` · ${item.size}`}
                    {item.color && ` · ${item.color}`}
                  </p>
                </div>
                <span style={{ fontSize: font.base, fontWeight: 700, color: colors.dark, flexShrink: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Price breakdown ── */}
        <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.25rem', marginBottom: '1rem', boxShadow: shadow.card }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: font.sm }}>
            <Row label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
            {order.discount > 0 && (
              <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`−$${order.discount.toFixed(2)}`} green />
            )}
            <Row
              label="Shipping"
              value={order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}
              green={order.shippingCost === 0}
            />
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: font.base }}>
              <span style={{ color: colors.dark }}>Total</span>
              <span style={{ color: colors.dark }}>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Shipping + Payment ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.25rem', boxShadow: shadow.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <MapPin size={14} color={colors.muted} strokeWidth={2} />
              <p style={{ fontSize: '11px', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Shipping to</p>
            </div>
            <p style={{ fontSize: font.sm, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.25rem', boxShadow: shadow.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <CreditCard size={14} color={colors.muted} strokeWidth={2} />
              <p style={{ fontSize: '11px', fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Payment</p>
            </div>
            <p style={{ fontSize: font.sm, color: colors.dark, margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase' }}>{order.paymentMethod}</p>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: radius.full, backgroundColor: order.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF3C7', color: order.paymentStatus === 'paid' ? '#16A34A' : '#D97706' }}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href="/orders"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: colors.primary, color: '#fff', textDecoration: 'none', padding: '13px', borderRadius: radius.md, fontSize: font.base, fontWeight: 700, textAlign: 'center' }}
          >
            View all orders <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <Link
            href="/shops"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: colors.white, color: colors.dark, textDecoration: 'none', padding: '13px', borderRadius: radius.md, fontSize: font.base, fontWeight: 600, border: `1px solid ${colors.border}`, textAlign: 'center' }}
          >
            <ShoppingBag size={16} strokeWidth={1.75} /> Continue shopping
          </Link>
        </div>

      </div>
    </div>
  )
}

/* ── Helpers ── */
function Row({ label, value, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: colors.muted }}>{label}</span>
      <span style={{ fontWeight: 500, color: green ? '#16A34A' : colors.dark }}>{value}</span>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1.25rem 5rem', fontFamily: font.family }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[120, 80, 200, 120, 80].map((h, i) => (
          <div key={i} style={{ height: `${h}px`, borderRadius: radius.xxl, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}