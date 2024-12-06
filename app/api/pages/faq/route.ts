import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import type { FAQItem } from '@/types/pages'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sectionId = searchParams.get('sectionId')

  if (!sectionId) {
    return NextResponse.json(
      { error: 'Section ID is required' },
      { status: 400 }
    )
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('section_id', sectionId)
    .order('sort_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // Verify user has permission
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const {
    data: { role },
  } = await supabase.rpc('get_user_role', {
    user_id: session.user.id,
  })

  if (role !== 'staff') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  try {
    const json = await request.json()
    const newFAQ: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'> = json

    const { data, error } = await supabase
      .from('faq_items')
      .insert(newFAQ)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating FAQ item' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // Verify user has permission
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const {
    data: { role },
  } = await supabase.rpc('get_user_role', {
    user_id: session.user.id,
  })

  if (role !== 'staff') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  try {
    const json = await request.json()
    const { id, ...updates } = json

    const { data, error } = await supabase
      .from('faq_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating FAQ item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'FAQ item ID is required' },
      { status: 400 }
    )
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // Verify user has permission
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const {
    data: { role },
  } = await supabase.rpc('get_user_role', {
    user_id: session.user.id,
  })

  if (role !== 'staff') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  try {
    const { error } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting FAQ item' },
      { status: 500 }
    )
  }
}
