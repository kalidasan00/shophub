'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useCartStore from '@/store/useCartStore'
import useAuthStore from '@/store/useAuthStore'
import { ordersAPI } from '@/lib/api'
import { colors, font, radius, shadow, transition } from '@/lib/styles'

const paymentMethods = [
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const user = useAuthStore((state) => state.user)

  const [address, setAddress] = useState({
    street: '', city: '', state: '', zip: '', country: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [couponCode, setCouponCode] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
    }
  }, [user])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = couponCode.toLowerCase() === 'save10' ? subtotal * 0.1 : 0
  const shippingCost = subtotal > 50 ? 0 : 9.99
  const total = subtotal - discount + shippingCost

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const isAddressComplete = Object.values(address).every((v) => v.trim() !== '')

  const handlePlaceOrder = async () => {
    if (!isAddressComplete) {
      setError('Please fill in all shipping address fields')
      return
    }
    setError(null)
    setPlacing(true)

    try {
      const orderItems = items.map((item) => ({
        product: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        icon: item.icon || '📦',
        size: item.size || '',
        color: item.color || '',
      }))

      const res = await ordersAPI.create({
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
      })

      clearCart()
      router.push(`/orders/${res.data.order._id}?success=1`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
      setPlacing(false)
    }
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 5rem', fontFamily: font.family }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: font.sm, color: colors.muted, marginBottom: '1.5rem' }}>
        <Link href="/cart" style={{ color: colors.muted, textDecoration: 'none' }}>Cart</Link>
        <span>/</span>
        <span style={{ color: colors.dark, fontWeight: 500 }}>Checkout</span>
      </div>

      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: colors.dark, marginBottom: '1.75rem' }}>
        Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Shipping Address */}
          <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.5rem', boxShadow: shadow.card }}>
            <h2 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, marginBottom: '1.25rem' }}>
              Shipping Address
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FormField label="Street Address" name="street" value={address.street} onChange={handleAddressChange} placeholder="123 Main St" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <FormField label="City" name="city" value={address.city} onChange={handleAddressChange} placeholder="New York" />
                <FormField label="State" name="state" value={address.state} onChange={handleAddressChange} placeholder="NY" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <FormField label="ZIP Code" name="zip" value={address.zip} onChange={handleAddressChange} placeholder="10001" />
                <FormField label="Country" name="country" value={address.country} onChange={handleAddressChange} placeholder="United States" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.5rem', boxShadow: shadow.card }}>
            <h2 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, marginBottom: '1.25rem' }}>
              Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    border: `1px solid ${paymentMethod === method.value ? colors.primary : colors.border}`,
                    borderRadius: radius.lg,
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === method.value ? colors.primaryLight : colors.white,
                    transition: transition.base,
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ accentColor: colors.primary, width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '1.125rem' }}>{method.icon}</span>
                  <span style={{ fontSize: font.base, fontWeight: 500, color: colors.dark }}>{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Items Review (mobile-friendly summary of what's being ordered) */}
          <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.5rem', boxShadow: shadow.card }}>
            <h2 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, marginBottom: '1.25rem' }}>
              Order Items ({items.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {items.map((item) => (
                <div key={item.id || item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '48px', height: '48px', minWidth: '48px',
                    backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
                    borderRadius: radius.md, overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  }}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (item.icon || '📦')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: font.base, fontWeight: 500, color: colors.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: font.sm, color: colors.muted, margin: 0 }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontSize: font.base, fontWeight: 600, color: colors.dark }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div style={{ backgroundColor: colors.white, borderRadius: radius.xxl, border: `1px solid ${colors.border}`, padding: '1.5rem', boxShadow: shadow.card, position: 'sticky', top: '80px' }}>
          <h2 style={{ fontSize: font.lg, fontWeight: 600, color: colors.dark, marginBottom: '1.25rem' }}>Order Summary</h2>

          {/* Coupon */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: font.base, fontWeight: 500, color: colors.dark, marginBottom: '8px' }}>Coupon Code</p>
            <input
              type="text"
              placeholder="Enter code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '9px 12px', fontSize: font.base, fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
            {couponCode.toLowerCase() === 'save10' && (
              <p style={{ fontSize: font.sm, color: colors.green, marginTop: '6px' }}>✓ 10% discount applied</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: font.base }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>Subtotal</span>
              <span style={{ fontWeight: 500, color: colors.dark }}>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.green }}>
                <span>Discount</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>Shipping</span>
              <span style={{ fontWeight: 500, color: shippingCost === 0 ? colors.green : colors.dark }}>
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${colors.border}`, margin: '1.25rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: font.md, fontWeight: 600, color: colors.dark }}>Total</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: colors.dark }}>${total.toFixed(2)}</span>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: radius.md, padding: '10px 14px', marginBottom: '1rem', fontSize: font.sm, color: colors.red }}>
              {error}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{
              display: 'block', width: '100%', padding: '14px',
              backgroundColor: placing ? '#A5B4FC' : colors.primary,
              color: colors.white, border: 'none', textAlign: 'center',
              borderRadius: radius.md, fontSize: font.md, fontWeight: 600,
              fontFamily: font.family, cursor: placing ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box',
            }}
          >
            {placing ? 'Placing order...' : 'Place Order'}
          </button>

          <p style={{ fontSize: font.xs, color: '#9CA3AF', textAlign: 'center', marginTop: '0.75rem' }}>
            By placing this order, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: colors.dark, marginBottom: '6px' }}>
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '11px 14px', fontSize: font.base, fontFamily: font.family, outline: 'none', color: colors.dark, backgroundColor: colors.white, boxSizing: 'border-box' }}
        onFocus={(e) => e.target.style.borderColor = colors.primary}
        onBlur={(e) => e.target.style.borderColor = colors.border}
      />
    </div>
  )
}