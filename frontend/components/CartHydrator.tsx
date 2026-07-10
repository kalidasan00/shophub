'use client'

import { useEffect } from 'react'
import { rehydrateCart } from '@/store/useCartStore'

// Fix: the actual localStorage read now only happens here, inside a
// useEffect — which by definition runs after the component has mounted
// and after React has already reconciled server vs. client output. This
// is what actually stops the hydration mismatch (and the accompanying
// "state update on a component that hasn't mounted yet" warning, which
// was happening because persist's default auto-rehydration was trying
// to update the store synchronously during the render/mount phase
// instead of safely after it).
//
// Renders nothing — just runs the effect once.
export default function CartHydrator() {
  useEffect(() => {
    rehydrateCart()
  }, [])

  return null
}