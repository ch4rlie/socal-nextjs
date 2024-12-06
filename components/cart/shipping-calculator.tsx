import { useEffect, useState } from 'react'
import { useShipping, CartItem } from '@/hooks/useShipping'
import { ProductCategory, ShippingInfo } from '@/types/shipping'
import { Loader2 } from 'lucide-react'
import { RegionSelector } from '../product/region-selector'

interface ShippingCalculatorProps {
  items: CartItem[]
  onShippingChange?: (total: number) => void
}

export function ShippingCalculator({ items, onShippingChange }: ShippingCalculatorProps) {
  const { userRegion, isLoading, calculateCartShipping } = useShipping()
  const [shippingBreakdown, setShippingBreakdown] = useState<Record<ProductCategory, ShippingInfo>>({})
  const [total, setTotal] = useState(0)
  const [loadingRates, setLoadingRates] = useState(true)

  useEffect(() => {
    async function calculateShipping() {
      if (isLoading || items.length === 0) return

      setLoadingRates(true)
      const { total, breakdown } = await calculateCartShipping(items)
      setTotal(total)
      setShippingBreakdown(breakdown)
      onShippingChange?.(total)
      setLoadingRates(false)
    }

    calculateShipping()
  }, [items, userRegion, isLoading, calculateCartShipping, onShippingChange])

  if (items.length === 0) {
    return null
  }

  if (isLoading || loadingRates) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Calculating shipping...</span>
      </div>
    )
  }

  const hasMultipleCategories = Object.keys(shippingBreakdown).length > 1

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium">Shipping to {userRegion}</h3>
          <p className="text-sm text-gray-600">
            Total shipping: ${total.toFixed(2)}
          </p>
        </div>
        <RegionSelector />
      </div>

      {hasMultipleCategories && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Shipping breakdown:</p>
          {Object.entries(shippingBreakdown).map(([category, info]) => {
            const categoryItems = items.filter(item => item.product_category === category)
            const itemCount = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
            const categoryTotal = info.baseRate + 
              (itemCount > 1 ? (itemCount - 1) * info.additionalItemRate : 0)

            return (
              <div key={category} className="flex justify-between text-xs text-gray-600">
                <span>{category.replace(/_/g, ' ').toLowerCase()}:</span>
                <span>${categoryTotal.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      )}

      {userRegion !== 'USA' && (
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md space-y-2">
          <p>International orders may be subject to customs duties and taxes.</p>
          <p>Estimated delivery: {Math.max(...Object.values(shippingBreakdown).map(info => info.estimatedDays || 0))} business days</p>
        </div>
      )}
    </div>
  )
}
