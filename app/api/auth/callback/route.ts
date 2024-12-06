import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { event, session } = await request.json()
    
    if (session) {
      await supabase.auth.setSession(session)
    }

    return NextResponse.json({ message: 'Auth callback successful' }, { status: 200 })
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
