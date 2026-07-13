'use client'

import { useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'

// Runs once per app load: asks the server "is there a valid session
// cookie attached to this request?" via GET /auth/me, and populates the
// store accordingly. Must run in useEffect (after mount) for the same
// SSR-hydration-mismatch reason as CartHydrator — the server has no way
// to know the answer during the initial render.
export default function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return null
}