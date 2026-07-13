'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader, Store, ChevronDown, Check } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { shopsAPI } from '@/lib/api'
import { colors, font, radius, shadow } from '@/lib/styles'
import { CenteredMessage } from './components/shared'
import SellerOnboarding from './components/SellerOnboarding'
import SellerDashboard from './components/SellerDashboard'

const SELECTED_SHOP_KEY = 'selectedShopId'

export default function SellerDashboardPage() {
  const router      = useRouter()
  const user        = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const setUser     = useAuthStore((state) => state.setUser)

  const [checking, setChecking] = useState(true)
  const [shops,    setShops]    = useState([])   // all shops owned by this user
  const [shop,     setShop]     = useState(null) // the currently selected shop
  const [error,    setError]    = useState(null)

  useEffect(() => {
    // Fix: previously redirected as soon as `user` was null, which is
    // also true for every page load — including a real logged-in
    // seller — until checkAuth() (triggered by AuthInitializer on app
    // mount) actually resolves. That bounced valid sellers off their own
    // dashboard on every refresh. Now waits for the real check first.
    if (initialized && user === null) { router.push('/auth/login?redirect=/seller'); return }
  }, [user, initialized])

  useEffect(() => {
    if (!user) return
    const loadShops = async () => {
      try {
        const res = await shopsAPI.getMine()
        const myShops = res.data.shops || []
        setShops(myShops)

        // Restore the last-selected shop if it still exists among this
        // user's shops, otherwise default to the first one.
        const savedId = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_SHOP_KEY) : null
        const restored = myShops.find((s) => s._id === savedId)
        setShop(restored || myShops[0] || null)
      } catch { setError('load-failed') }
      finally  { setChecking(false) }
    }
    loadShops()
  }, [user])

  const handleSwitchShop = (selected) => {
    setShop(selected)
    if (typeof window !== 'undefined') localStorage.setItem(SELECTED_SHOP_KEY, selected._id)
  }

  if (!initialized) return null // still verifying session — render nothing rather than flash a redirect
  if (!user) return null

  if (checking) return (
    <CenteredMessage icon={<Loader size={36} color={colors.muted} strokeWidth={1.5} />} title="Loading..." />
  )

  if (error === 'load-failed') return (
    <CenteredMessage
      icon={<AlertTriangle size={36} color={colors.muted} strokeWidth={1.5} />}
      title="Couldn't load your shop"
      subtitle="Please refresh and try again."
    />
  )

  if (!shop) return (
    <SellerOnboarding
      onCreated={(newShop) => {
        setShops([newShop])
        setShop(newShop)
        setUser({ ...user, role: 'shopowner' })
      }}
    />
  )

  return (
    <>
      {shops.length > 1 && (
        <ShopSwitcher shops={shops} activeShop={shop} onSwitch={handleSwitchShop} />
      )}
      <SellerDashboard
        shop={shop}
        onShopUpdate={(updated) => {
          setShop(updated)
          setShops((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
        }}
      />
    </>
  )
}

/* ── Shop Switcher ── */
function ShopSwitcher({ shops, activeShop, onSwitch }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 1.25rem', position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'none',
            border: `1px solid ${colors.border}`,
            borderRadius: radius.md,
            padding: '8px 14px',
            cursor: 'pointer',
            fontFamily: font.family,
          }}
        >
          <div style={{
            width: '28px', height: '28px', minWidth: '28px', borderRadius: '50%',
            background: `linear-gradient(${activeShop.gradient?.direction || '135deg'}, ${activeShop.gradient?.from || colors.primary}, ${activeShop.gradient?.to || colors.primary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
          }}>
            {activeShop.icon || '🛍️'}
          </div>
          <span style={{ fontSize: font.base, fontWeight: '600', color: colors.dark }}>{activeShop.name}</span>
          <ChevronDown size={16} color={colors.muted} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>

        {open && (
          <>
            {/* Click-away backdrop */}
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />

            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: '1.25rem',
              minWidth: '260px',
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
                Your shops
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
                      width: '28px', height: '28px', minWidth: '28px', borderRadius: '50%',
                      background: `linear-gradient(${s.gradient?.direction || '135deg'}, ${s.gradient?.from || colors.primary}, ${s.gradient?.to || colors.primary})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px',
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
    </div>
  )
}