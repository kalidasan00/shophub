'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { shopsAPI } from '@/lib/api'
import { colors } from '@/lib/styles'
import { CenteredMessage } from './components/shared'
import SellerOnboarding from './components/SellerOnboarding'
import ShopSwitcher from './components/ShopSwitcher'
import SellerDashboard from './components/SellerDashboard'

export default function SellerDashboardPage() {
  const router      = useRouter()
  const user        = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const setUser     = useAuthStore((state) => state.setUser)

  const [checking, setChecking]           = useState(true)
  const [shops, setShops]                 = useState([])
  const [currentShopId, setCurrentShopId] = useState(null)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    if (initialized && user === null) { router.push('/auth/login?redirect=/seller'); return }
  }, [user, initialized])

  useEffect(() => {
    if (!user) return
    const loadShops = async () => {
      try {
        const res = await shopsAPI.getAll({ owner: user.id || user._id })
        // Fix: previously only ever kept shops?.[0] — a seller with two
        // or more shops would silently only ever see and manage the
        // first one, with no way to reach the others at all. Now keeps
        // the full list.
        const allShops = res.data.shops || []
        setShops(allShops)
        if (allShops.length > 0) {
          const lastUsed = typeof window !== 'undefined' ? localStorage.getItem('lastShopId') : null
          const match = allShops.find((s) => s._id === lastUsed)
          setCurrentShopId((match || allShops[0])._id)
        }
      } catch {
        setError('load-failed')
      } finally {
        setChecking(false)
      }
    }
    loadShops()
  }, [user])

  const handleShopCreated = (newShop) => {
    setShops((prev) => [...prev, newShop])
    setCurrentShopId(newShop._id)
    if (typeof window !== 'undefined') localStorage.setItem('lastShopId', newShop._id)
    setUser({ ...user, role: 'shopowner' })
  }

  const handleSwitchShop = (shopId) => {
    setCurrentShopId(shopId)
    if (typeof window !== 'undefined') localStorage.setItem('lastShopId', shopId)
  }

  if (!initialized) return null
  if (!user) return null

  if (checking) return (
    <CenteredMessage icon={<Loader size={36} color={colors.muted} strokeWidth={1.5} />} title="Loading..." />
  )

  if (error === 'load-failed') return (
    <CenteredMessage
      icon={<AlertTriangle size={36} color={colors.muted} strokeWidth={1.5} />}
      title="Couldn't load your shops"
      subtitle="Please refresh and try again."
    />
  )

  if (shops.length === 0) {
    return <SellerOnboarding onCreated={handleShopCreated} />
  }

  const currentShop = shops.find((s) => s._id === currentShopId) || shops[0]

  return (
    <div>
      <ShopSwitcher
        user={user}
        shops={shops}
        currentShop={currentShop}
        onSwitch={handleSwitchShop}
        renderAddShopFlow={(onDone) => (
          <SellerOnboarding
            onCreated={(newShop) => {
              handleShopCreated(newShop)
              onDone()
            }}
          />
        )}
      />
      <SellerDashboard shop={currentShop} onShopUpdate={(updated) => {
        setShops((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
      }} />
    </div>
  )
}