import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { CartItem } from '@/stores/cartStore'
import { formatCurrency } from '@/utils/currency'

interface OrderConfirmationEmailProps {
  orderNumber: string
  items: CartItem[]
  total: number
  customerName: string
}

export default function OrderConfirmationEmail({
  orderNumber,
  items,
  total,
  customerName,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your SoCal Shop Order Confirmation #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmation</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Thank you for your order! We've received your order and will begin
            processing it right away.
          </Text>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Order Details
            </Heading>
            <Text style={text}>Order Number: #{orderNumber}</Text>

            {items.map((item) => (
              <div key={item.product.id} style={productContainer}>
                <div>
                  <Text style={productName}>{item.product.name}</Text>
                  <Text style={text}>Quantity: {item.quantity}</Text>
                </div>
                <Text style={price}>
                  {formatCurrency(item.product.price * item.quantity)}
                </Text>
              </div>
            ))}

            <Hr style={hr} />

            <div style={totalContainer}>
              <Text style={totalText}>Total</Text>
              <Text style={totalPrice}>{formatCurrency(total)}</Text>
            </div>
          </Section>

          <Text style={text}>
            We'll send you another email when your order ships.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            This email was sent from SoCal Shop. If you have any questions, please
            contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '5px',
  margin: '24px 0',
}

const productContainer = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  margin: '24px 0',
}

const productName = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const price = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const hr = {
  borderColor: '#dedede',
  margin: '20px 0',
}

const totalContainer = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  margin: '24px 0',
}

const totalText = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const totalPrice = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  margin: '24px 0',
}
