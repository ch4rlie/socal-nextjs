import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/utils/stripe'
import { CartItem } from '@/stores/cartStore'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { items } = await request.json() as { items: CartItem[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const session = await createCheckoutSession(items)

    // Create order in Supabase
    const supabase = createClient()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        status: 'pending',
        total_amount: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      // Continue with checkout even if order creation fails
      // We can handle this case in the webhook
    }

    return NextResponse.json({ sessionId: session.id, orderId: order?.id })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
