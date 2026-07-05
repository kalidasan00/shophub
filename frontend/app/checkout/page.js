'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, Smartphone, Banknote, Package, Check, ChevronLeft } from 'lucide-react'
import useCartStore from '@/store/useCartStore'
import useAuthStore from '@/store/useAuthStore'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const paymentMethods = [
  { value: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={17} strokeWidth={1.5} /> },
  { value: 'upi',  label: 'UPI',                  icon: <Smartphone  size={17} strokeWidth={1.5} /> },
  { value: 'cod',  label: 'Cash on Delivery',     icon: <Banknote    size={17} strokeWidth={1.5} /> },
]

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const user = useAuthStore((state) => state.user)

  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: 'India' })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [couponCode, setCouponCode] = useState('')
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(false)   // ← prevents cart-empty redirect after order
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) router.push('/auth/login?redirect=/checkout')
  }, [user])

  // Only redirect to cart if order hasn't been placed yet
  useEffect(() => {
    if (items.length === 0 && !placed) router.push('/cart')
  }, [items, placed])

  const subtotal     = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount     = couponCode.toLowerCase() === 'save10' ? subtotal * 0.1 : 0
  const shippingCost = subtotal > 50 ? 0 : 9.99
  const total        = subtotal - discount + shippingCost
  const itemCount     = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value })
  const isAddressComplete   = Object.values(address).every((v) => v.trim() !== '')

  const handlePlaceOrder = async () => {
    if (!isAddressComplete) { setError('Please fill in all shipping address fields'); return }
    setError(null)
    setPlacing(true)
    try {
      const orderItems = items.map((item) => ({
        product:  item.id || item._id,
        name:     item.name,
        price:    item.price,
        quantity: item.quantity,
        size:     item.size  || '',
        color:    item.color || '',
      }))
      const res = await ordersAPI.create({
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
      })
      setPlaced(true)   // ← set BEFORE clearCart so useEffect doesn't redirect to /cart
      clearCart()
      router.push(`/orders/${res.data.order._id}?success=1`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
      setPlacing(false)
    }
  }

  if (!user || (items.length === 0 && !placed)) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family, paddingBottom: '148px' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 1rem' }}>
        <Link href="/cart" aria-label="Back to cart" style={{ display: 'flex', color: colors.dark }}>
          <ChevronLeft size={20} />
        </Link>
        <span style={{ fontSize: '15px', fontWeight: '700', color: colors.dark }}>Checkout</span>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '10px 1rem 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Shipping Address */}
        <Section title="Shipping address">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <FormField label="Street address" name="street" value={address.street} onChange={handleAddressChange} placeholder="House no., building, street" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FormField label="City" name="city" value={address.city} onChange={handleAddressChange} placeholder="Kozhikode" />
              <FormField label="State" name="state" value={address.state} onChange={handleAddressChange} placeholder="Kerala" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FormField label="Pincode" name="zip" value={address.zip} onChange={handleAddressChange} placeholder="673001" />
              <FormField label="Country" name="country" value={address.country} onChange={handleAddressChange} placeholder="India" />
            </div>
          </div>
        </Section>

        {/* Payment Method */}
        <Section title="Payment method">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paymentMethods.map((method) => (
              <label
                key={method.value}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 12px',
                  border: `1px solid ${paymentMethod === method.value ? colors.primary : colors.border}`,
                  borderRadius: radius.md, cursor: 'pointer',
                  backgroundColor: paymentMethod === method.value ? colors.primary + '0D' : colors.white,
                  transition: transition.base,
                }}
              >
                <input
                  type="radio" name="paymentMethod" value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: colors.primary, width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span style={{ color: paymentMethod === method.value ? colors.primary : colors.muted, display: 'flex' }}>
                  {method.icon}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: colors.dark }}>{method.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Order Items */}
        <Section title={`Order items (${itemCount})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item) => (
              <div key={item.id || item._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '44px', height: '44px', minWidth: '44px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Package size={18} color={colors.muted} strokeWidth={1.5} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12.5px', fontWeight: 500, color: colors.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '11px', color: colors.muted, margin: 0 }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: colors.dark }}>
                  ₹{Math.round(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Coupon */}
        <Section title="Coupon code">
          <input
            type="text" placeholder="Enter code" value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '9px 12px', fontSize: '13px', fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e)  => e.target.style.borderColor = colors.border}
          />
          {couponCode.toLowerCase() === 'save10' && (
            <p style={{ fontSize: '12px', color: '#16A34A', marginTop: '6px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={13} strokeWidth={2.5} /> 10% discount applied
            </p>
          )}
        </Section>

        {/* Price summary */}
        <Section title="Price details">
          <Row label="Subtotal" value={`₹${Math.round(subtotal)}`} />
          {discount > 0 && <Row label="Discount" value={`− ₹${Math.round(discount)}`} green />}
          <Row label="Shipping" value={shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`} green={shippingCost === 0} />
          <div style={{ borderTop: `1px dashed ${colors.border}`, margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: colors.dark }}>Total</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: colors.dark }}>₹{Math.round(total)}</span>
          </div>
        </Section>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.md, padding: '10px 14px', fontSize: '12.5px', color: colors.red }}>
            {error}
          </div>
        )}

        <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: '4px 0 0' }}>
          By placing this order, you agree to our Terms of Service
        </p>
      </div>

      {/* Sticky place-order bar — sits above the global bottom tab nav, not underneath it */}
      <div style={{ position: 'fixed', bottom: '64px', left: 0, right: 0, backgroundColor: colors.white, borderTop: `1px solid ${colors.border}`, boxShadow: shadow.card, padding: '10px 1rem', zIndex: 20 }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: colors.dark }}>₹{Math.round(total)}</p>
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{
              flex: '0 0 auto',
              padding: '12px 26px',
              backgroundColor: placing ? '#A5B4FC' : colors.primary,
              color: colors.white, border: 'none', textAlign: 'center',
              borderRadius: radius.md, fontSize: '14px', fontWeight: 700,
              fontFamily: font.family, cursor: placing ? 'not-allowed' : 'pointer',
            }}
          >
            {placing ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ backgroundColor: colors.white, borderRadius: radius.lg, border: `1px solid ${colors.border}`, padding: '14px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, color: colors.dark, margin: '0 0 10px' }}>{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
      <span style={{ fontSize: '12.5px', color: colors.muted }}>{label}</span>
      <span style={{ fontSize: '12.5px', fontWeight: 600, color: green ? '#16A34A' : colors.dark }}>{value}</span>
    </div>
  )
}

function FormField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: colors.dark, marginBottom: '5px' }}>
        {label}
      </label>
      <input
        type="text" name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '10px 12px', fontSize: '13px', fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box' }}
        onFocus={(e) => e.target.style.borderColor = colors.primary}
        onBlur={(e)  => e.target.style.borderColor = colors.border}
      />
    </div>
  )
}