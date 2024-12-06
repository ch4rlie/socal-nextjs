import Link from 'next/link'
import { handleSuccessfulPayment } from '@/app/actions/orders'
import { getOrderBySessionId } from '@/utils/supabase'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  if (sessionId) {
    // Check if order already exists
    const existingOrder = await getOrderBySessionId(sessionId)

    if (!existingOrder) {
      // Create new order if it doesn't exist
      await handleSuccessfulPayment(sessionId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="rounded-full bg-green-100 p-3 mx-auto w-fit">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Thank you for your purchase!
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Your order has been confirmed and will be shipped soon.
            {!sessionId && " We'll send you shipping confirmation when your order ships."}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
