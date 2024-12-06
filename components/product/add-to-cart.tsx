'use client'

import { useState } from 'react'
import { formatCurrency } from '@/utils/currency'

interface Props {
  productId: string
  name: string
  price: number | null
  currency?: string
  availabilityStatus?: string
}

export function AddToCart({ productId, name, price = 0, currency = 'USD', availabilityStatus = 'active' }: Props) {
  const [quantity, setQuantity] = useState(1)

  const isAvailable = availabilityStatus === 'active'

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
    }
  }

  const addToCart = async () => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', { productId, name, quantity })
  }

  return (
    <div className="mt-6">
      <div className="quantity-selector">
        <label htmlFor="quantity" className="quantity-label">
          Quantity
        </label>
        <div className="quantity-controls">
          <button
            type="button"
            className="quantity-button"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            disabled={!isAvailable}
          >
            -
          </button>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="quantity-input"
            disabled={!isAvailable}
          />
          <button
            type="button"
            className="quantity-button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!isAvailable}
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={addToCart}
        disabled={!isAvailable}
        className="add-to-cart-button"
      >
        {isAvailable ? (
          <>
            Add to Cart - {formatCurrency((price ?? 0) * quantity, currency)}
          </>
        ) : (
          'Out of Stock'
        )}
      </button>
    </div>
  )
}
