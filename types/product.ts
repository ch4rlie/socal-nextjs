import { ShippingDimensions } from './shipping'

export type ProductType = 
  | 'BASIC_SHIRT'
  | 'HEAVY_OUTERWEAR'
  | 'AOP_LIGHT'
  | 'AOP_HEAVY'
  | 'AOP_PREMIUM'
  | 'HEADWEAR'
  | 'DEFAULT'

export interface ShippingRate {
  product_type: ProductType
  flat_rate: number
  free_shipping_threshold: number
}

export interface Product {
  id: string
  created_at: string
  name: string
  description: string | null
  retail_price: number | null
  currency: string
  images: string[]
  thumbnail_url: string | null
  custom_thumbnail_url: string | null
  slug: string
  availability_status: string
  external_id: string | null
  sync_product_id: string | null
  variant_id: string | null
  main_category_id: number | null
  embroidery_type: string | null
  thread_colors: string[] | null
  product_type: ProductType
  shipping_type: 'flat_rate' | 'free'
  shipping_rate: number
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  brand?: string
  color?: string[]
  size?: string[]
  material?: string[]
  category_path?: string[]
  review_count?: number
  review_average?: number
  printful_sync_timestamp?: string
  last_sync_error?: string | null
  updated_at: string
  weight?: number // in kg
  dimensions?: {
    length: number
    width: number
    height: number
  }
  inStock?: boolean
  variants?: ProductVariant[]
  metadata?: Record<string, any>
}

export interface ProductVariant {
  id: string
  product_id: string
  name?: string
  sku: string
  retail_price: number
  compare_at_price?: number
  inventory_quantity: number
  weight?: number
  dimensions?: ShippingDimensions
  preview_image_url?: string
  availability_status?: string
  is_active: boolean
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  slug: string
  image?: string
  parentId?: string
  metadata?: Record<string, any>
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  rating: number
  review_text?: string
  review_title?: string
  verified_purchase: boolean
  helpful_votes: number
  created_at: string
  updated_at: string
  images?: string[]
  reviewer?: {
    username?: string
    full_name?: string
    avatar_url?: string
  }
}
