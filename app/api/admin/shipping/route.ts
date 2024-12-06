import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ProductCategory, ShippingRegion } from '@/types/shipping'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!userRoles || userRoles.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    // Get all shipping rates
    const { data: rates, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .order('product_category')
      .order('region')
    
    if (error) throw error
    
    return NextResponse.json(rates)
  } catch (error) {
    console.error('Error fetching shipping rates:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!userRoles || userRoles.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const body = await request.json()
    const { product_category, region, base_rate, additional_item_rate } = body
    
    // Validate input
    if (!product_category || !region || base_rate === undefined || additional_item_rate === undefined) {
      return new NextResponse('Missing required fields', { status: 400 })
    }
    
    // Update or insert shipping rate
    const { data, error } = await supabase
      .from('shipping_rates')
      .upsert({
        product_category,
        region,
        base_rate,
        additional_item_rate,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'product_category,region'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating shipping rate:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!userRoles || userRoles.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const product_category = searchParams.get('product_category') as ProductCategory
    const region = searchParams.get('region') as ShippingRegion
    
    if (!product_category || !region) {
      return new NextResponse('Missing required parameters', { status: 400 })
    }
    
    // Delete shipping rate
    const { error } = await supabase
      .from('shipping_rates')
      .delete()
      .eq('product_category', product_category)
      .eq('region', region)
    
    if (error) throw error
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting shipping rate:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
