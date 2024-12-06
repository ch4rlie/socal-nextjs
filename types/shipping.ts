export type ShippingRegion = 
  | 'USA'
  | 'Europe'
  | 'UK'
  | 'EFTA'
  | 'Canada'
  | 'Australia_NZ'
  | 'Japan'
  | 'Brazil'
  | 'Worldwide'

export type ProductCategory = 
  | 'BASIC_SHIRT'      // T-shirts, tank tops, etc
  | 'HEAVY_OUTERWEAR'  // Hoodies, sweatshirts, jackets
  | 'AOP_LIGHT'        // All-over print shirts, leggings, etc
  | 'AOP_HEAVY'        // All-over print hoodies, sweatshirts
  | 'AOP_PREMIUM'      // All-over print windbreakers, track pants
  | 'HEADWEAR'         // Hats, beanies, visors
  | 'DEFAULT'

export interface ShippingDimensions {
  length?: number
  width?: number
  height?: number
  unit?: string
}

export interface ShippingInfo {
  baseRate: number
  additionalItemRate: number
  region: ShippingRegion
  estimatedDays: number
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
}

export interface ShippingMethod {
  id: string
  name: string
  description: string
  estimatedDays: number
  price: number
  carrier?: string
  trackingAvailable: boolean
}

export interface ShippingRate {
  id: number
  product_category: ProductCategory
  region: ShippingRegion
  base_rate: number
  additional_item_rate: number
  created_at: string
  updated_at: string
}
