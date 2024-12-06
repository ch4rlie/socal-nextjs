export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-12 w-3/4 mx-auto bg-gray-200 animate-pulse rounded"></div>
            <div className="mt-3 h-6 w-1/2 mx-auto bg-gray-200 animate-pulse rounded"></div>
          </div>

          <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="mt-3 h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="mt-1 h-4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="mt-6">
                    <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
