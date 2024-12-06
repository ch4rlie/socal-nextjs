import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, ProductType } from '@/types/product'
import { ShippingRegion } from '@/types/shipping'

interface ShippingStore {
  region: ShippingRegion
  setRegion: (region: ShippingRegion) => void
  calculateShippingRate: (product: Product) => Promise<number | null>
}

// Base rates by product type and region
const SHIPPING_RATES: Record<ProductType, Record<ShippingRegion, number>> = {
  'BASIC_SHIRT': {
    'USA': 4.69,
    'Europe': 4.79,
    'UK': 4.59,
    'EFTA': 9.99,
    'Canada': 8.29,
    'Australia_NZ': 7.19,
    'Japan': 4.39,
    'Brazil': 4.49,
    'Worldwide': 11.99,
  },
  'HEAVY_OUTERWEAR': {
    'USA': 8.49,
    'Europe': 6.99,
    'UK': 6.99,
    'EFTA': 10.99,
    'Canada': 10.19,
    'Australia_NZ': 11.29,
    'Japan': 6.99,
    'Brazil': 5.99,
    'Worldwide': 16.99,
  },
  'AOP_LIGHT': {
    'USA': 3.99,
    'Europe': 4.59,
    'UK': 4.39,
    'EFTA': 9.99,
    'Canada': 6.99,
    'Australia_NZ': 7.19,
    'Japan': 4.39,
    'Brazil': 4.49,
    'Worldwide': 11.99,
  },
  'AOP_HEAVY': {
    'USA': 7.99,
    'Europe': 6.99,
    'UK': 6.99,
    'EFTA': 10.99,
    'Canada': 9.39,
    'Australia_NZ': 11.29,
    'Japan': 6.99,
    'Brazil': 5.99,
    'Worldwide': 16.99,
  },
  'AOP_PREMIUM': {
    'USA': 7.99,
    'Europe': 8.99,
    'UK': 8.99,
    'EFTA': 8.99,
    'Canada': 7.99,
    'Australia_NZ': 7.99,
    'Japan': 7.99,
    'Brazil': 7.99,
    'Worldwide': 8.99,
  },
  'HEADWEAR': {
    'USA': 3.99,
    'Europe': 4.59,
    'UK': 4.39,
    'EFTA': 9.99,
    'Canada': 6.99,
    'Australia_NZ': 7.19,
    'Japan': 4.39,
    'Brazil': 4.49,
    'Worldwide': 11.99,
  },
  'DEFAULT': {
    'USA': 4.69,
    'Europe': 4.79,
    'UK': 4.59,
    'EFTA': 9.99,
    'Canada': 8.29,
    'Australia_NZ': 7.19,
    'Japan': 4.39,
    'Brazil': 4.49,
    'Worldwide': 11.99,
  }
}

export const useShipping = create<ShippingStore>()(
  persist(
    (set) => ({
      region: 'USA',
      
      setRegion: (region: ShippingRegion) => {
        set({ region })
      },

      calculateShippingRate: async (product: Product) => {
        try {
          const { region } = useShipping.getState()
          const productType = product.product_type || 'DEFAULT'
          
          // Get base rate for product type and region
          const baseRate = SHIPPING_RATES[productType]?.[region]
          
          if (!baseRate) {
            console.error('Invalid shipping configuration:', { productType, region })
            return null
          }

          // Add weight-based calculation with fallback
          const weight = product.weight || 0.5 // Default to 0.5 kg if no weight specified
          const weightMultiplier = weight * 0.5

          // Add size-based calculation with fallback
          const dimensions = product.dimensions || { length: 20, width: 20, height: 5 } // Default dimensions in cm
          const sizeMultiplier = 
            (dimensions.length * dimensions.width * dimensions.height) * 0.0001

          const totalRate = baseRate + weightMultiplier + sizeMultiplier

          // If product has free shipping and total price meets threshold
          if (product.shipping_type === 'free' && product.retail_price && product.retail_price >= 75) {
            return 0
          }

          // Log shipping calculation for debugging
          console.log('Shipping calculation:', {
            region,
            productType,
            baseRate,
            weight,
            weightMultiplier,
            dimensions,
            sizeMultiplier,
            totalRate,
            shippingType: product.shipping_type,
            retailPrice: product.retail_price
          })

          return Math.round(totalRate * 100) / 100 // Round to 2 decimal places
        } catch (error) {
          console.error('Error calculating shipping rate:', error)
          return null
        }
      },
    }),
    {
      name: 'shipping-storage',
      skipHydration: true,
    }
  )
)
