import { Resend } from 'resend'
import { CartItem } from '@/stores/cartStore'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail({
  email,
  orderNumber,
  items,
  total,
  customerName,
}: {
  email: string
  orderNumber: string
  items: CartItem[]
  total: number
  customerName: string
}) {
  try {
    await resend.emails.send({
      from: 'SoCal Shop <orders@your-domain.com>',
      to: email,
      subject: `Order Confirmation #${orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber,
        items,
        total,
        customerName,
      }),
    })
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
  }
}

export async function sendOrderShippedEmail({
  email,
  orderNumber,
  trackingNumber,
  customerName,
}: {
  email: string
  orderNumber: string
  trackingNumber: string
  customerName: string
}) {
  try {
    // TODO: Create and use OrderShippedEmail template
    await resend.emails.send({
      from: 'SoCal Shop <orders@your-domain.com>',
      to: email,
      subject: `Your Order #${orderNumber} Has Shipped`,
      text: `Hi ${customerName},\n\nYour order #${orderNumber} has shipped! Track your package with tracking number: ${trackingNumber}\n\nThanks,\nSoCal Shop`,
    })
  } catch (error) {
    console.error('Failed to send order shipped email:', error)
  }
}
