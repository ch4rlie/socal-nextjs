import { createClient } from './server'
import { Database } from '@/types/supabase'

// Types from the old supabase.ts
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

// Helper Functions
export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createOrder(orderData: Omit<Order, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createOrderItems(items: Omit<OrderItem, 'id' | 'created_at'>[]) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('order_items').insert(items).select()

  if (error) throw error
  return data
}

export async function getUserByEmail(email: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) throw error
  return data
}

export async function getOrderBySessionId(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error) throw error
  return data
}

export async function getUserOrders(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrdersByEmail(email: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*), images(*)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProduct(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*), images(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
