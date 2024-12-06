import { ShippingRegion } from '@/types/shipping'

type DeliveryEstimates = {
  [key in ShippingRegion]: {
    min: number
    max: number
  }
}

const deliveryEstimates: DeliveryEstimates = {
  'USA': { min: 3, max: 5 },
  'Europe': { min: 7, max: 14 },
  'United Kingdom': { min: 7, max: 14 },
  'EFTA States': { min: 7, max: 14 },
  'Canada': { min: 5, max: 10 },
  'Australia/New Zealand': { min: 10, max: 21 },
  'Japan': { min: 7, max: 14 },
  'Brazil': { min: 10, max: 21 },
  'Worldwide': { min: 14, max: 28 }
}

export function getEstimatedDelivery(region: ShippingRegion): string {
  const estimate = deliveryEstimates[region]
  if (!estimate) return ''

  if (estimate.min === estimate.max) {
    return `${estimate.min} business days`
  }

  return `${estimate.min}-${estimate.max} business days`
}

export function getFreeShippingThreshold(region: ShippingRegion): number {
  switch (region) {
    case 'USA':
      return 150
    case 'Canada':
      return 200
    case 'Europe':
    case 'United Kingdom':
    case 'EFTA States':
      return 250
    case 'Australia/New Zealand':
    case 'Japan':
    case 'Brazil':
      return 300
    default:
      return 500
  }
}

export function formatDeliveryDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

export function isEligibleForFreeShipping(
  subtotal: number,
  region: ShippingRegion
): boolean {
  const threshold = getFreeShippingThreshold(region)
  return subtotal >= threshold
}

export function calculateShippingProgress(
  subtotal: number,
  region: ShippingRegion
): {
  progress: number
  remaining: number
} {
  const threshold = getFreeShippingThreshold(region)
  const progress = Math.min((subtotal / threshold) * 100, 100)
  const remaining = Math.max(threshold - subtotal, 0)

  return {
    progress,
    remaining
  }
}
