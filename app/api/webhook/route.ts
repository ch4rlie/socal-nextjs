import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe'
import { createClient } from '@/utils/supabase/server'
import { sendOrderConfirmationEmail } from '@/utils/email'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient()

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any

      // Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent: session.payment_intent,
          paid_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)
        .select('*')
        .single()

      if (orderError) {
        console.error('Error updating order:', orderError)
        return NextResponse.json(
          { error: 'Error updating order status' },
          { status: 500 }
        )
      }

      // Get customer details from Stripe
      const customer = await stripe.customers.retrieve(session.customer as string)

      // Send order confirmation email
      if (order) {
        await sendOrderConfirmationEmail({
          email: customer.email!,
          orderNumber: order.id,
          items: order.items,
          total: order.total_amount,
          customerName: customer.name || 'Valued Customer',
        })
      }

      // Update product inventory
      if (order) {
        for (const item of order.items) {
          await supabase.rpc('decrease_product_stock', {
            p_id: item.product_id,
            quantity: item.quantity
          })
        }
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as any

      // Update order status to expired
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'expired',
        })
        .eq('stripe_session_id', session.id)

      if (orderError) {
        console.error('Error updating order:', orderError)
        return NextResponse.json(
          { error: 'Error updating order status' },
          { status: 500 }
        )
      }

      break
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
