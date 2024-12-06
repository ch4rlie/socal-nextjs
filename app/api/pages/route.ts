import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import type { Page } from '@/types/pages'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const type = searchParams.get('type')
  const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

  const supabase = createRouteHandlerClient<Database>({ cookies })

  let query = supabase
    .from('pages')
    .select(`
      *,
      page_sections (
        *,
        faq_items (*)
      )
    `)

  if (slug) {
    query = query.eq('slug', slug).single()
  } else if (type) {
    query = query.eq('page_type', type)
  }

  if (!includeUnpublished) {
    query = query.eq('is_published', true)
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
    const newPage: Omit<Page, 'id' | 'created_at' | 'updated_at'> = {
      ...json,
      author_id: session.user.id,
      last_edited_by: session.user.id,
    }

    const { data, error } = await supabase
      .from('pages')
      .insert(newPage)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating page' },
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

    // Create revision before updating
    const { data: currentPage } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single()

    if (currentPage) {
      await supabase.from('page_revisions').insert({
        page_id: id,
        content: currentPage.content,
        title: currentPage.title,
        meta_title: currentPage.meta_title,
        meta_description: currentPage.meta_description,
        edited_by: session.user.id,
        version: currentPage.version,
      })
    }

    // Update the page
    const { data, error } = await supabase
      .from('pages')
      .update({
        ...updates,
        last_edited_by: session.user.id,
        version: currentPage ? currentPage.version + 1 : 1,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating page' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Page ID is required' },
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
      .from('pages')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting page' },
      { status: 500 }
    )
  }
}
