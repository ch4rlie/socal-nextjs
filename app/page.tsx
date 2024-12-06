import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

interface Product {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  custom_thumbnail_url: string | null;
  retail_price: number | null;
  currency: string;
  is_active: boolean;
  slug: string;
}

const Home: NextPage = async () => {
  try {
    const supabase = await createClient()
    
    // Fetch products from our database
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    console.log('Products query result:', { products, error })

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    if (!products || products.length === 0) {
      return (
        <div className="min-h-screen bg-gray-100">
          <main className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  No Products Available
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Check back soon for our latest products!
                </p>
              </div>
            </div>
          </main>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                SoCal Collection
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Discover our latest California-inspired designs
              </p>
            </div>

            <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
              {products.map((product: Product) => {
                const thumbnailUrl = product.custom_thumbnail_url || product.thumbnail_url || '/placeholder-image.jpg'
                const price = product.retail_price ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: product.currency
                }).format(product.retail_price) : null

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white transition duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex-shrink-0 relative h-48">
                      <Image
                        className="object-cover"
                        src={thumbnailUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="mt-3 text-base text-gray-500 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        {price && (
                          <p className="mt-3 text-lg font-medium text-gray-900">
                            {price}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error in Home page:', error)
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Error Loading Products
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Please try again later.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default Home
