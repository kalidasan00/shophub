'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Lock, MapPin, Package, ChevronRight, ChevronLeft, ChevronDown, Check, AlertCircle,
  Store, Wallet, Ticket, Headphones, MoreVertical,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { authAPI, shopsAPI } from '@/lib/api'
import { colors, font, radius, shadow } from '@/lib/styles'

const SELECTED_SHOP_KEY = 'selectedShopId' // same key used on /seller, so the choice stays in sync across both pages

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

/* ── Hub-specific styles ── */
const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: colors.muted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 8px 2px',
}

const rowCardStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '15px 16px',
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.lg,
  marginBottom: '10px',
  cursor: 'pointer',
  textAlign: 'left',
  textDecoration: 'none',
  fontFamily: font.family,
}

type HubRow = { label: string; Icon: any; onClick: () => void }

function RowCard({ label, Icon, onClick }: HubRow) {
  return (
    <button onClick={onClick} style={rowCardStyle}>
      <Icon size={20} color={colors.dark} strokeWidth={1.6} />
      <span style={{ flex: 1, fontSize: font.base, fontWeight: '500', color: colors.dark }}>{label}</span>
      <ChevronRight size={17} color={colors.muted} />
    </button>
  )
}

function RowLink({ href, label, Icon }: { href: string; label: string; Icon: any }) {
  return (
    <Link href={href} style={rowCardStyle}>
      <Icon size={20} color={colors.dark} strokeWidth={1.6} />
      <span style={{ flex: 1, fontSize: font.base, fontWeight: '500', color: colors.dark }}>{label}</span>
      <ChevronRight size={17} color={colors.muted} />
    </Link>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state: any) => state.initialized)
  const logout = useAuthStore((state: any) => state.logout)
  const [view, setView] = useState<'hub' | 'profile' | 'security' | 'addresses'>('hub')

  const [myShops, setMyShops] = useState<any[]>([])
  const [activeShop, setActiveShop] = useState<any>(null)

  useEffect(() => {
    // Fix: previously redirected as soon as `user` was null, which was
    // also true for the brief moment before checkAuth() (triggered from
    // AuthInitializer on app mount) had actually resolved — bouncing
    // valid logged-in users to /login on every refresh. Now waits until
    // the real session check has completed before deciding to redirect.
    if (initialized && !user) router.push('/auth/login?redirect=/account')
  }, [user, initialized])

  const isSeller = user?.role === 'shopowner' || user?.role === 'admin'

  useEffect(() => {
    if (!user || !isSeller) return
    const loadShops = async () => {
      try {
        const res = await shopsAPI.getMine()
        const shops = res.data.shops || []
        setMyShops(shops)

        const savedId = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_SHOP_KEY) : null
        const restored = shops.find((s: any) => s._id === savedId)
        setActiveShop(restored || shops[0] || null)
      } catch {
        // Non-fatal: the switcher just won't render if this fails, hub still works
      }
    }
    loadShops()
  }, [user, isSeller])

  const handleSwitchShop = (selected: any) => {
    setActiveShop(selected)
    if (typeof window !== 'undefined') localStorage.setItem(SELECTED_SHOP_KEY, selected._id)
  }

  if (!initialized) return null // still verifying session with the server — render nothing rather than flash a redirect
  if (!user) return null

  const handleLogout = async () => {
    if (typeof logout === 'function') await logout()
    router.push('/')
  }

  const viewTitles: Record<string, string> = {
    profile: 'Personal information',
    security: 'Security',
    addresses: 'Manage addresses',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.surface, fontFamily: font.family }}>

      {/* Header */}
      <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 2rem) 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {view !== 'hub' ? (
              <button onClick={() => setView('hub')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <ChevronLeft size={22} color={colors.dark} />
              </button>
            ) : (
              <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '50%', backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', fontWeight: '700' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              {view === 'hub' ? (
                <>
                  <h1 style={{ fontSize: '17px', fontWeight: '700', color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </h1>
                  <p style={{ fontSize: '13px', color: colors.muted, margin: '2px 0 0' }}>{user.email}</p>
                </>
              ) : (
                <h1 style={{ fontSize: '17px', fontWeight: '700', color: colors.dark, margin: 0 }}>{viewTitles[view]}</h1>
              )}
            </div>

            {view === 'hub' && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} aria-label="More options">
                <MoreVertical size={20} color={colors.dark} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.25rem, 3vw, 2rem) 1.25rem 4rem' }}>

        {view === 'hub' && (
          <>
            {/* Active shop switcher — Instagram/Facebook-style: shows the active
                account, tap to see and switch to any other shop this user owns.
                Only rendered for sellers who own more than one shop. */}
            {isSeller && myShops.length > 1 && activeShop && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={sectionLabelStyle}>Active shop</p>
                <ShopSwitcher shops={myShops} activeShop={activeShop} onSwitch={handleSwitchShop} />
              </div>
            )}

            <p style={sectionLabelStyle}>Orders and payments</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <RowLink href="/orders" label="Orders" Icon={Package} />
              <RowLink href="/account/wallet" label="Wallet" Icon={Wallet} />
              <RowLink href="/account/coupons" label="Coupons" Icon={Ticket} />
            </div>

            <p style={sectionLabelStyle}>Account settings</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <RowCard label="Personal information" Icon={User} onClick={() => setView('profile')} />
              <RowCard label="Manage addresses" Icon={MapPin} onClick={() => setView('addresses')} />
              <RowCard label="Security" Icon={Lock} onClick={() => setView('security')} />
            </div>

            <p style={sectionLabelStyle}>More</p>
            <div style={{ marginBottom: '2rem' }}>
              <RowLink href="/help" label="Help centre" Icon={Headphones} />
              <RowLink href="/seller" label={isSeller ? 'Seller dashboard' : 'Become a seller'} Icon={Store} />
            </div>

            <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: font.family, fontSize: '14px', fontWeight: '600', color: '#EF4444', padding: '12px' }}>
              Log out
            </button>
          </>
        )}

        {view === 'profile'   && <ProfileTab   user={user} />}
        {view === 'security'  && <SecurityTab  />}
        {view === 'addresses' && <AddressesTab user={user} />}
      </div>
    </div>
  )
}

/* ── Shop Switcher (Instagram/Facebook-style active account switcher) ── */
function ShopSwitcher({ shops, activeShop, onSwitch }: { shops: any[]; activeShop: any; onSwitch: (s: any) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: colors.white,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          padding: '12px 14px',
          cursor: 'pointer',
          fontFamily: font.family,
          boxShadow: shadow.card,
        }}
      >
        <div style={{
          width: '38px', height: '38px', minWidth: '38px', borderRadius: '50%',
          background: `linear-gradient(${activeShop.gradient?.direction || '135deg'}, ${activeShop.gradient?.from || colors.primary}, ${activeShop.gradient?.to || colors.primary})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>
          {activeShop.icon || '🛍️'}
        </div>

        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <p style={{ fontSize: font.base, fontWeight: '600', color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeShop.name}
          </p>
          <p style={{ fontSize: '12px', color: colors.muted, margin: '1px 0 0' }}>{activeShop.category} · Active</p>
        </div>

        <ChevronDown size={18} color={colors.muted} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />

          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            boxShadow: shadow.card,
            zIndex: 20,
            overflow: 'hidden',
          }}>
            <p style={{
              fontSize: '11px', fontWeight: '600', color: colors.muted,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              margin: 0, padding: '10px 14px 6px',
            }}>
              Switch shop
            </p>

            {shops.map((s) => {
              const isActive = s._id === activeShop._id
              return (
                <button
                  key={s._id}
                  onClick={() => { onSwitch(s); setOpen(false) }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    background: isActive ? colors.primaryLight : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: font.family,
                  }}
                >
                  <div style={{
                    width: '30px', height: '30px', minWidth: '30px', borderRadius: '50%',
                    background: `linear-gradient(${s.gradient?.direction || '135deg'}, ${s.gradient?.from || colors.primary}, ${s.gradient?.to || colors.primary})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px',
                  }}>
                    {s.icon || '🛍️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: colors.dark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.muted, margin: '1px 0 0' }}>{s.category}</p>
                  </div>
                  {isActive && <Check size={16} color={colors.primary} />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Status Message ── */
function StatusMessage({ status, successText, errorText }: { status: string, successText: string, errorText: string }) {
  if (status === 'idle') return null
  const ok = status === 'success'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`, borderRadius: radius.md, padding: '10px 14px', fontSize: '13px', color: ok ? '#16A34A' : '#EF4444', marginBottom: '1rem' }}>
      {ok ? <Check size={15} /> : <AlertCircle size={15} />}
      {ok ? successText : errorText}
    </div>
  )
}

/* ── Profile Tab ── */
function ProfileTab({ user }: { user: any }) {
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [e.target.name]: e.target.value }); setStatus('idle') }

  const handleSubmit = async (e: React.FormEvent) => {
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
          <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
        <Field label="Email address">
          <input type="email" value={user.email} disabled style={{ ...inputStyle, backgroundColor: colors.surface, color: colors.muted, cursor: 'not-allowed' }} />
        </Field>
        <Field label="Phone number">
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Not set" style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} />
        </Field>
      </div>
      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

/* ── Security Tab ── */
function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [e.target.name]: e.target.value }); setStatus('idle') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { setErrorMsg('New passwords do not match'); setStatus('error'); return }
    if (form.newPassword.length < 6) { setErrorMsg('Password must be at least 6 characters'); setStatus('error'); return }
    setSaving(true)
    try {
      await authAPI.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setStatus('success')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password')
      setStatus('error')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Change Password</h2>
      <StatusMessage status={status} successText="Password updated successfully" errorText={errorMsg} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Current password"><input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
        <Field label="New password"><input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required minLength={6} style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
        <Field label="Confirm new password"><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
      </div>
      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

/* ── Addresses Tab ── */
function AddressesTab({ user }: { user: any }) {
  const [form, setForm] = useState({ street: user.address?.street || '', city: user.address?.city || '', state: user.address?.state || '', zip: user.address?.zip || '', country: user.address?.country || '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [e.target.name]: e.target.value }); setStatus('idle') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try { await authAPI.updateProfile({ address: form }); setStatus('success') }
    catch { setStatus('error') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <h2 style={cardTitleStyle}>Shipping Address</h2>
      <p style={{ fontSize: '13px', color: colors.muted, marginTop: '-8px', marginBottom: '1.25rem' }}>Used as your default address at checkout.</p>
      <StatusMessage status={status} successText="Address saved successfully" errorText="Failed to save address" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Street address"><input type="text" name="street" value={form.street} onChange={handleChange} placeholder="123 Main St" style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Field label="City"><input type="text" name="city" value={form.city} onChange={handleChange} placeholder="New York" style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
          <Field label="State"><input type="text" name="state" value={form.state} onChange={handleChange} placeholder="NY" style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <Field label="ZIP code"><input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="10001" style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
          <Field label="Country"><input type="text" name="country" value={form.country} onChange={handleChange} placeholder="United States" style={inputStyle} onFocus={(e) => e.target.style.borderColor = colors.primary} onBlur={(e) => e.target.style.borderColor = colors.border} /></Field>
        </div>
      </div>
      <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, marginTop: '1.25rem', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  )
}

/* ── Field ── */
function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.dark, marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  )
}