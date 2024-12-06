'use client'

import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Order successful!
        </h1>
        <p className="mt-4 text-gray-600">
          Thank you for your order. We'll send you a confirmation email with your order details.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
