'use server'

import { stripe } from '@/utils/stripe'
import {
  createOrder,
  createOrderItems,
  getUserByEmail,
  type Order,
  type OrderItem,
} from '@/utils/supabase'

export async function handleSuccessfulPayment(sessionId: string) {
  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details', 'shipping_details'],
    })

    if (!session?.customer_details?.email) {
      throw new Error('No customer email found')
    }

    // Check if user exists in Supabase
    const user = await getUserByEmail(session.customer_details.email)

    // Create order data
    const orderData: Omit<Order, 'id' | 'created_at'> = {
      user_id: user?.id, // Will be null if user doesn't exist
      email: session.customer_details.email,
      session_id: session.id,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || 'usd',
      status: session.payment_status === 'paid' ? 'complete' : 'processing',
      shipping_address: session.shipping_details,
    }

    // Create the order in Supabase
    const order = await createOrder(orderData)

    // Create order items
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId)
    
    const orderItems: Omit<OrderItem, 'id' | 'created_at'>[] = lineItems.data.map(
      (item) => ({
        order_id: order.id,
        product_id: item.price?.product as string,
        variant_id: item.price?.id as string,
        name: item.description || '',
        price: item.amount_total ? item.amount_total / 100 : 0,
        quantity: item.quantity || 1,
      })
    )

    await createOrderItems(orderItems)

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Error handling successful payment:', error)
    return { success: false, error: 'Failed to process order' }
  }
}
