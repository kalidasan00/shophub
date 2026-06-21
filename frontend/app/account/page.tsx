'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, MapPin, Package, ChevronRight, Check, AlertCircle } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { authAPI } from '@/lib/api'
import { colors, font, radius, shadow } from '@/lib/styles'

const tabs = [
  { key: 'profile', label: 'Profile', Icon: User },
  { key: 'security', label: 'Security', Icon: Lock },
  { key: 'addresses', label: 'Addresses', Icon: MapPin },
]

export default function AccountPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/account')
    }
  }, [user])

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>

      {/* Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '56px', height: '56px', minWidth: '56px', borderRadius: '50%',
              backgroundColor: colors.primaryLight, color: colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700',
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: '700', color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </h1>
              <p style={{ fontSize: '13px', color: colors.muted, margin: '2px 0 0' }}>{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) 1.25rem 4rem' }}>

        {/* Order history quick link */}
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

        {/* Tabs */}
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

        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'addresses' && <AddressesTab user={user} />}
      </div>
    </div>
  )
}

function StatusMessage({ status, successText, errorText }: { status: 'idle' | 'success' | 'error', successText: string, errorText: string }) {
  if (status === 'idle') return null
  const isSuccess = status === 'success'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      backgroundColor: isSuccess ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${isSuccess ? '#BBF7D0' : '#FECACA'}`,
      borderRadius: radius.md, padding: '10px 14px', fontSize: '13px',
      color: isSuccess ? '#16A34A' : colors.red, marginBottom: '1rem',
    }}>
      {isSuccess ? <Check size={15} /> : <AlertCircle size={15} />}
      {isSuccess ? successText : errorText}
    </div>
  )
}

function ProfileTab({ user }: { user: any }) {
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authAPI.updateProfile(form)
      setStatus('success')
    } catch (err) {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Profile Information</h2>

      <StatusMessage status={status} successText="Profile updated successfully" errorText="Failed to update profile" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Full name">
          <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
        </Field>
        <Field label="Email address">
          <input type="email" value={user.email} disabled style={{ ...inputStyle, backgroundColor: colors.surface, color: colors.muted, cursor: 'not-allowed' }} />
        </Field>
        <Field label="Phone number">
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Not set" style={inputStyle} />
        </Field>
      </div>

      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.newPassword !== form.confirmPassword) {
      setErrorMsg('New passwords do not match')
      setStatus('error')
      return
    }
    if (form.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters')
      setStatus('error')
      return
    }

    setSaving(true)
    try {
      await authAPI.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setStatus('success')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password')
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Change Password</h2>

      <StatusMessage status={status} successText="Password updated successfully" errorText={errorMsg} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Current password">
          <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required style={inputStyle} />
        </Field>
        <Field label="New password">
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required minLength={6} style={inputStyle} />
        </Field>
        <Field label="Confirm new password">
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required minLength={6} style={inputStyle} />
        </Field>
      </div>

      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

function AddressesTab({ user }: { user: any }) {
  const [form, setForm] = useState({
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    zip: user.address?.zip || '',
    country: user.address?.country || '',
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authAPI.updateProfile({ address: form })
      setStatus('success')
    } catch (err) {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Shipping Address</h2>
      <p style={{ fontSize: '13px', color: colors.muted, marginTop: '-8px', marginBottom: '1.25rem' }}>
        This address will be used as your default at checkout.
      </p>

      <StatusMessage status={status} successText="Address saved successfully" errorText="Failed to save address" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Street address">
          <input type="text" name="street" value={form.street} onChange={handleChange} placeholder="123 Main St" style={inputStyle} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Field label="City">
            <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="New York" style={inputStyle} />
          </Field>
          <Field label="State">
            <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="NY" style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Field label="ZIP code">
            <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="10001" style={inputStyle} />
          </Field>
          <Field label="Country">
            <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="United States" style={inputStyle} />
          </Field>
        </div>
      </div>

      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.dark, marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  borderRadius: radius.xxl,
  border: `1px solid ${colors.border}`,
  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
  boxShadow: shadow.card,
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: font.lg,
  fontWeight: '600',
  color: colors.dark,
  marginBottom: '1.25rem',
  marginTop: 0,
}

const inputStyle: React.CSSProperties = {
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

const primaryBtnStyle: React.CSSProperties = {
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