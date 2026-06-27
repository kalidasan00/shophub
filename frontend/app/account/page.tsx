'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, MapPin, Package, ChevronRight, Check, AlertCircle, Store, ArrowRight } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { authAPI } from '@/lib/api'
import { colors, font, radius, shadow } from '@/lib/styles'

const tabs = [
  { key: 'profile',   label: 'Profile',   Icon: User   },
  { key: 'security',  label: 'Security',  Icon: Lock   },
  { key: 'addresses', label: 'Addresses', Icon: MapPin },
]

const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: radius.xxl,
  border: `1px solid ${colors.border}`,
  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
  boxShadow: shadow.card,
}

const cardTitleStyle = {
  fontSize: font.lg,
  fontWeight: '600',
  color: colors.dark,
  marginBottom: '1.25rem',
  marginTop: 0,
}

const inputStyle = {
  width: '100%',
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  padding: '11px 14px',
  fontSize: '14px',
  fontFamily: font.family,
  outline: 'none',
  color: colors.dark,
  backgroundColor: colors.white,
  boxSizing: 'border-box',
}

const primaryBtnStyle = {
  backgroundColor: colors.primary,
  color: colors.white,
  border: 'none',
  borderRadius: radius.md,
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  fontFamily: font.family,
  cursor: 'pointer',
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function AccountPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user) router.push('/auth/login?redirect=/account')
  }, [user])

  if (!user) return null

  const isSeller = user.role === 'shopowner' || user.role === 'admin'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>

      {/* Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', minWidth: '56px', borderRadius: '50%', backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: '700', color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </h1>
              <p style={{ fontSize: '13px', color: colors.muted, margin: '2px 0 0' }}>{user.email}</p>
            </div>
            {/* Role badge */}
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: radius.full, backgroundColor: isSeller ? colors.primaryLight : colors.surface, color: isSeller ? colors.primary : colors.muted, border: `1px solid ${isSeller ? colors.primary + '33' : colors.border}`, flexShrink: 0 }}>
              {isSeller ? 'Seller' : 'Buyer'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) 1.25rem 4rem' }}>

        {/* ── Seller CTA / Dashboard link ── */}
        <Link
          href="/seller"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            backgroundColor: isSeller ? colors.white : colors.primary,
            border: `1px solid ${isSeller ? colors.border : colors.primary}`,
            borderRadius: radius.xxl, padding: '1rem 1.25rem', marginBottom: '1rem',
            textDecoration: 'none', boxShadow: shadow.card,
            transition: 'opacity 0.15s',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: radius.md, backgroundColor: isSeller ? colors.primaryLight : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Store size={20} color={isSeller ? colors.primary : '#fff'} strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: font.base, fontWeight: '600', color: isSeller ? colors.dark : '#fff', margin: 0 }}>
              {isSeller ? 'Seller Dashboard' : 'Become a Seller'}
            </p>
            <p style={{ fontSize: '12px', color: isSeller ? colors.muted : 'rgba(255,255,255,0.75)', margin: '1px 0 0' }}>
              {isSeller ? 'Manage your shop, products and orders' : 'Set up your shop and start selling today'}
            </p>
          </div>
          <ArrowRight size={18} color={isSeller ? colors.muted : '#fff'} strokeWidth={1.75} />
        </Link>

        {/* Orders quick link */}
        <Link
          href="/orders"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            backgroundColor: colors.white, border: `1px solid ${colors.border}`,
            borderRadius: radius.xxl, padding: '1rem 1.25rem', marginBottom: '1.25rem',
            textDecoration: 'none', boxShadow: shadow.card,
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: radius.md, backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={20} color={colors.primary} strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: font.base, fontWeight: '600', color: colors.dark, margin: 0 }}>My Orders</p>
            <p style={{ fontSize: '12px', color: colors.muted, margin: '1px 0 0' }}>Track and view your order history</p>
          </div>
          <ChevronRight size={18} color={colors.muted} />
        </Link>

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', overflowX: 'auto' }}>
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: radius.full,
                border: `1px solid ${activeTab === key ? colors.primary : colors.border}`,
                backgroundColor: activeTab === key ? colors.primary : colors.white,
                color: activeTab === key ? colors.white : colors.muted,
                fontSize: '13px', fontWeight: '500', fontFamily: font.family,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'profile'   && <ProfileTab   user={user} />}
        {activeTab === 'security'  && <SecurityTab  />}
        {activeTab === 'addresses' && <AddressesTab user={user} />}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STATUS MESSAGE
══════════════════════════════════════════════ */
function StatusMessage({ status, successText, errorText }) {
  if (status === 'idle') return null
  const ok = status === 'success'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`, borderRadius: radius.md, padding: '10px 14px', fontSize: '13px', color: ok ? '#16A34A' : '#EF4444', marginBottom: '1rem' }}>
      {ok ? <Check size={15} /> : <AlertCircle size={15} />}
      {ok ? successText : errorText}
    </div>
  )
}

/* ══════════════════════════════════════════════
   PROFILE TAB
══════════════════════════════════════════════ */
function ProfileTab({ user }) {
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('idle')

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setStatus('idle') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await authAPI.updateProfile(form); setStatus('success') }
    catch { setStatus('error') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Profile Information</h2>
      <StatusMessage status={status} successText="Profile updated successfully" errorText="Failed to update profile" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Full name">
          <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="Email address">
          <input type="email" value={user.email} disabled style={{ ...inputStyle, backgroundColor: colors.surface, color: colors.muted, cursor: 'not-allowed' }} />
        </Field>
        <Field label="Phone number">
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Not set" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
      </div>
      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════════════
   SECURITY TAB
══════════════════════════════════════════════ */
function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setStatus('idle') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { setErrorMsg('New passwords do not match'); setStatus('error'); return }
    if (form.newPassword.length < 6) { setErrorMsg('Password must be at least 6 characters'); setStatus('error'); return }
    setSaving(true)
    try {
      await authAPI.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setStatus('success')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password')
      setStatus('error')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Change Password</h2>
      <StatusMessage status={status} successText="Password updated successfully" errorText={errorMsg} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Current password">
          <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="New password">
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required minLength={6} style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="Confirm new password">
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
      </div>
      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════════════
   ADDRESSES TAB
══════════════════════════════════════════════ */
function AddressesTab({ user }) {
  const [form, setForm] = useState({
    street:  user.address?.street  || '',
    city:    user.address?.city    || '',
    state:   user.address?.state   || '',
    zip:     user.address?.zip     || '',
    country: user.address?.country || '',
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('idle')

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setStatus('idle') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await authAPI.updateProfile({ address: form }); setStatus('success') }
    catch { setStatus('error') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Shipping Address</h2>
      <p style={{ fontSize: '13px', color: colors.muted, marginTop: '-8px', marginBottom: '1.25rem' }}>
        Used as your default address at checkout.
      </p>
      <StatusMessage status={status} successText="Address saved successfully" errorText="Failed to save address" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Street address">
          <input type="text" name="street" value={form.street} onChange={handleChange} placeholder="123 Main St" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Field label="City">
            <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="New York" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border} />
          </Field>
          <Field label="State">
            <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="NY" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Field label="ZIP code">
            <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="10001" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border} />
          </Field>
          <Field label="Country">
            <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="United States" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border} />
          </Field>
        </div>
      </div>
      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  )
}

/* ══════════════════════════════════════════════
   SHARED
══════════════════════════════════════════════ */
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.dark, marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}