export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          retail_price: number | null
          currency: string
          images: string[]
          thumbnail_url: string | null
          custom_thumbnail_url: string | null
          slug: string
          availability_status: string
          is_active: boolean
          weight: number | null
          dimensions: Json | null
          shipping_type: string
          shipping_rate: number | null
          product_type: 'BASIC_SHIRT' | 'HEAVY_OUTERWEAR' | 'AOP_LIGHT' | 'AOP_HEAVY' | 'AOP_PREMIUM' | 'HEADWEAR' | 'DEFAULT'
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          retail_price?: number | null
          currency?: string
          images?: string[]
          thumbnail_url?: string | null
          custom_thumbnail_url?: string | null
          slug: string
          availability_status?: string
          is_active?: boolean
          weight?: number | null
          dimensions?: Json | null
          shipping_type?: string
          shipping_rate?: number | null
          product_type?: 'BASIC_SHIRT' | 'HEAVY_OUTERWEAR' | 'AOP_LIGHT' | 'AOP_HEAVY' | 'AOP_PREMIUM' | 'HEADWEAR' | 'DEFAULT'
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          retail_price?: number | null
          currency?: string
          images?: string[]
          thumbnail_url?: string | null
          custom_thumbnail_url?: string | null
          slug?: string
          availability_status?: string
          is_active?: boolean
          weight?: number | null
          dimensions?: Json | null
          shipping_type?: string
          shipping_rate?: number | null
          product_type?: 'BASIC_SHIRT' | 'HEAVY_OUTERWEAR' | 'AOP_LIGHT' | 'AOP_HEAVY' | 'AOP_PREMIUM' | 'HEADWEAR' | 'DEFAULT'
          metadata?: Json | null
        }
      }
      product_variants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          product_id: string
          sku: string | null
          name: string | null
          retail_price: number | null
          compare_at_price: number | null
          inventory_quantity: number
          weight: number | null
          dimensions: Json | null
          is_active: boolean
          preview_image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id: string
          sku?: string | null
          name?: string | null
          retail_price?: number | null
          compare_at_price?: number | null
          inventory_quantity?: number
          weight?: number | null
          dimensions?: Json | null
          is_active?: boolean
          preview_image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          product_id?: string
          sku?: string | null
          name?: string | null
          retail_price?: number | null
          compare_at_price?: number | null
          inventory_quantity?: number
          weight?: number | null
          dimensions?: Json | null
          is_active?: boolean
          preview_image_url?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          created_at: string
          updated_at: string
          status: string
          shipping_address: Json
          billing_address: Json
          shipping_method: string
          shipping_cost: number
          subtotal: number
          tax: number
          total: number
          payment_status: string
          payment_method: string | null
          tracking_number: string | null
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          shipping_address: Json
          billing_address: Json
          shipping_method: string
          shipping_cost: number
          subtotal: number
          tax: number
          total: number
          payment_status?: string
          payment_method?: string | null
          tracking_number?: string | null
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          shipping_address?: Json
          billing_address?: Json
          shipping_method?: string
          shipping_cost?: number
          subtotal?: number
          tax?: number
          total?: number
          payment_status?: string
          payment_method?: string | null
          tracking_number?: string | null
          notes?: string | null
          metadata?: Json | null
        }
      }
      shopping_carts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          status: string
          expires_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          status?: string
          expires_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          expires_at?: string
          metadata?: Json | null
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          variant_id: string
          quantity: number
          added_at: string
          custom_options: Json | null
        }
        Insert: {
          id?: string
          cart_id: string
          variant_id: string
          quantity: number
          added_at?: string
          custom_options?: Json | null
        }
        Update: {
          id?: string
          cart_id?: string
          variant_id?: string
          quantity?: number
          added_at?: string
          custom_options?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          billing_address: Json | null
          shipping_address: Json | null
          email: string | null
          phone: string | null
          preferences: Json
          last_sign_in: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          shipping_address?: Json | null
          email?: string | null
          phone?: string | null
          preferences?: Json
          last_sign_in?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          shipping_address?: Json | null
          email?: string | null
          phone?: string | null
          preferences?: Json
          last_sign_in?: string | null
        }
      }
    }
    Functions: {
      cleanup_expired_carts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_product_recommendations: {
        Args: {
          p_user_id: string
        }
        Returns: {
          product_id: string
          score: number
        }[]
      }
    }
  }
}

// Helper types for common database operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Product = Tables<'products'>
export type ProductVariant = Tables<'product_variants'>
export type Order = Tables<'orders'>
export type ShoppingCart = Tables<'shopping_carts'>
export type CartItem = Tables<'cart_items'>
export type Profile = Tables<'profiles'>

// Helper type for addresses
export interface Address {
  first_name: string
  last_name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  email?: string
}

// Helper type for dimensions
export interface Dimensions {
  length?: number
  width?: number
  height?: number
  unit?: 'in' | 'cm'
}
