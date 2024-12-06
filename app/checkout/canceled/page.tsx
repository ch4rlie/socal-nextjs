'use client'

import Link from 'next/link'
import { XCircleIcon } from '@heroicons/react/24/outline'

export default function CheckoutCanceledPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Order canceled
        </h1>
        <p className="mt-4 text-gray-600">
          Your order has been canceled. No charges were made to your card.
        </p>
        <div className="mt-8">
          <Link
            href="/checkout"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  )
}
