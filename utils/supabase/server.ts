import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Admin client for server-side operations that need elevated privileges
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
