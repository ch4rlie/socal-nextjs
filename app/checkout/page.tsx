'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/utils/currency'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to initialize')

      // Create Checkout Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      const { sessionId, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Clear cart (this will only run if redirect fails)
      clearCart()
    } catch (error: any) {
      console.error('Checkout error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-4">Add some items to your cart to checkout.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 px-4 py-6 sm:p-6 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center">
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-800">{item.product.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">{formatCurrency(getTotal())}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout form */}
        <div className="mt-10 lg:col-span-1 lg:mt-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Contact & Shipping</h2>
                <p className="mt-1 text-sm text-gray-500">
                  You'll enter your payment details on the next page.
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        There was an error processing your order
                      </h3>
                      <p className="mt-2 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Proceed to payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
