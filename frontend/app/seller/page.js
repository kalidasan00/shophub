'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import { shopsAPI } from '@/lib/api'
import { colors } from '@/lib/styles'
import { CenteredMessage } from './components/shared'
import SellerOnboarding from './components/SellerOnboarding'
import SellerDashboard from './components/SellerDashboard'

export default function SellerDashboardPage() {
  const router  = useRouter()
  const user    = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [checking, setChecking] = useState(true)
  const [shop,     setShop]     = useState(null)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (user === null) { router.push('/auth/login?redirect=/seller'); return }
  }, [user])

  useEffect(() => {
    if (!user) return
    const checkShop = async () => {
      try {
        const res = await shopsAPI.getAll({ owner: user.id || user._id })
        setShop(res.data.shops?.[0] || null)
      } catch { setError('load-failed') }
      finally  { setChecking(false) }
    }
    checkShop()
  }, [user])

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
        setShop(newShop)
        setUser({ ...user, role: 'shopowner' })
      }}
    />
  )

  return <SellerDashboard shop={shop} onShopUpdate={setShop} />
}