import Link from 'next/link'

export default function CanceledPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Order Canceled
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Your order has been canceled. No charges were made.
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
