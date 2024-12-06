'use client'

import { useState } from 'react'
import { Button } from '@nextui-org/react'
import { useCartStore } from '@/stores/cartStore'
import { CartDrawer } from './CartDrawer'

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { getItemCount } = useCartStore()
  const itemCount = getItemCount()

  return (
    <>
      <Button
        isIconOnly
        variant="light"
        radius="full"
        aria-label="Cart"
        onClick={() => setIsOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-indigo-600 text-xs font-medium text-white flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
