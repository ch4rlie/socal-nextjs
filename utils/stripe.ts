import Stripe from 'stripe'
import { CartItem } from '@/stores/cartStore'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createCheckoutSession(items: CartItem[]) {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.name,
        images: item.product.images || [],
        description: item.product.description,
      },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/canceled`,
    metadata: {
      items: JSON.stringify(items.map(item => ({
        id: item.product.id,
        quantity: item.quantity
      })))
    }
  })

  return session
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent']
  })
  return session
}
