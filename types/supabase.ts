export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          printful_id: number
          active: boolean
          custom_thumbnail_url: string | null
          thumbnail_url: string | null
          retail_price: number | null
          product_variants: ProductVariant[]
          product_images: ProductImage[]
          currency: string
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          canonical_url: string | null
          og_title: string | null
          og_description: string | null
          og_image_url: string | null
          structured_data: any | null
          slug: string | null
          printful_sync_timestamp: string
          updated_at: string
        }
        Insert: {
          id: string
          created_at: string
          name: string
          description?: string | null
          printful_id: number
          active: boolean
          custom_thumbnail_url?: string | null
          thumbnail_url?: string | null
          retail_price?: number | null
          product_variants?: ProductVariant[]
          product_images?: ProductImage[]
          currency?: string
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          canonical_url?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          structured_data?: any | null
          slug?: string | null
          printful_sync_timestamp?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          printful_id?: number
          active?: boolean
          custom_thumbnail_url?: string | null
          thumbnail_url?: string | null
          retail_price?: number | null
          product_variants?: ProductVariant[]
          product_images?: ProductImage[]
          currency?: string
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          canonical_url?: string | null
          og_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          structured_data?: any | null
          slug?: string | null
          printful_sync_timestamp?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          created_at: string
          product_id: string
          printful_variant_id: number
          size: string | null
          color: string | null
          price: number
          stock: number
          name: string
          thumbnail_url: string | null
          custom_thumbnail_url: string | null
          retail_price: number
          currency: string
          is_active: boolean
          printful_sync_timestamp: string
          updated_at: string
        }
        Insert: {
          id: string
          created_at: string
          product_id: string
          printful_variant_id: number
          size?: string | null
          color?: string | null
          price: number
          stock: number
          name: string
          thumbnail_url?: string | null
          custom_thumbnail_url?: string | null
          retail_price: number
          currency?: string
          is_active?: boolean
          printful_sync_timestamp?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string
          printful_variant_id?: number
          size?: string | null
          color?: string | null
          price?: number
          stock?: number
          name?: string
          thumbnail_url?: string | null
          custom_thumbnail_url?: string | null
          retail_price?: number
          currency?: string
          is_active?: boolean
          printful_sync_timestamp?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          created_at: string
          product_id: string
          variant_id: string | null
          image_url: string
          custom_image_url: string | null
          position: number
          is_thumbnail: boolean
          url: string
        }
        Insert: {
          id?: string
          created_at?: string
          product_id: string
          variant_id?: string | null
          image_url: string
          custom_image_url?: string | null
          position?: number
          is_thumbnail?: boolean
          url: string
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string
          variant_id?: string | null
          image_url?: string
          custom_image_url?: string | null
          position?: number
          is_thumbnail?: boolean
          url?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          email: string
          session_id: string
          amount_total: number
          currency: string
          status: 'complete' | 'canceled' | 'processing'
          shipping_address: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          session_id: string
          amount_total: number
          currency: string
          status: 'complete' | 'canceled' | 'processing'
          shipping_address: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          session_id?: string
          amount_total?: number
          currency?: string
          status?: 'complete' | 'canceled' | 'processing'
          shipping_address?: Json
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string
          name: string
          price: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id: string
          name: string
          price: number
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string
          name?: string
          price?: number
          quantity?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface Product {
  id: string
  created_at: string
  name: string
  description?: string
  printful_id: number
  active: boolean
  custom_thumbnail_url?: string
  thumbnail_url?: string
  retail_price?: number
  product_variants?: ProductVariant[]
  product_images?: ProductImage[]
}

export interface ProductVariant {
  id: string
  created_at: string
  product_id: string
  printful_variant_id: number
  size?: string
  color?: string
  price: number
  stock: number
}

export interface ProductImage {
  id: string
  url: string
  position: number
}
