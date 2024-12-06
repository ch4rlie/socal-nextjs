'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const store = useCart()

  // This handles hydration of the cart state
  useEffect(() => {
    store.persist.rehydrate()
  }, [])

  return <>{children}</>
}
