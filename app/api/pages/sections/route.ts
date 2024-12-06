import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import type { PageSection } from '@/types/pages'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')
  const sectionId = searchParams.get('sectionId')

  if (!pageId && !sectionId) {
    return NextResponse.json(
      { error: 'Page ID or Section ID is required' },
      { status: 400 }
    )
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  let query = supabase
    .from('page_sections')
    .select(`
      *,
      faq_items (*)
    `)

  if (pageId) {
    query = query.eq('page_id', pageId).order('sort_order')
  } else if (sectionId) {
    query = query.eq('id', sectionId).single()
  }

  const { data, error } = await query

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
    const newSection: Omit<PageSection, 'id' | 'created_at' | 'updated_at'> = json

    const { data, error } = await supabase
      .from('page_sections')
      .insert(newSection)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating section' },
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
      .from('page_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating section' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Section ID is required' },
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
      .from('page_sections')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting section' },
      { status: 500 }
    )
  }
}
