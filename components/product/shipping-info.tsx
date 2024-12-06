'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/utils/currency'
import { getEstimatedDelivery, getFreeShippingThreshold } from '@/utils/shipping'
import { useShipping } from '@/hooks/useShipping'
import { Product } from '@/types/product'
import { RegionSelector } from './region-selector'

interface ShippingInfoProps {
  product: Product
}

export function ShippingInfo({ product }: ShippingInfoProps) {
  const { calculateShippingRate, region } = useShipping()
  const [isLoading, setIsLoading] = useState(true)
  const [shippingRate, setShippingRate] = useState<number | null>(null)
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('')

  useEffect(() => {
    const getShippingInfo = async () => {
      setIsLoading(true)
      try {
        const rate = await calculateShippingRate(product)
        setShippingRate(rate)
        setEstimatedDelivery(getEstimatedDelivery(region))
      } catch (error) {
        console.error('Error calculating shipping:', error)
        setShippingRate(null)
      } finally {
        setIsLoading(false)
      }
    }

    getShippingInfo()
  }, [product, region, calculateShippingRate])

  const freeShippingThreshold = getFreeShippingThreshold(region)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Shipping</h3>
        <RegionSelector />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <i className="fa-solid fa-spinner fa-spin text-gray-500" />
        </div>
      ) : shippingRate === null ? (
        <div className="text-sm text-red-500">
          Unable to calculate shipping. Please try again or contact support.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Shipping to {region.replace('_', '/')}</span>
            <span className="font-medium">{formatCurrency(shippingRate)}</span>
          </div>
          {estimatedDelivery && (
            <div className="text-sm text-gray-500">
              Estimated delivery: {estimatedDelivery}
            </div>
          )}
          {product.shipping_type === 'free' && (
            <div className="text-sm text-green-600">
              Free shipping available!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
