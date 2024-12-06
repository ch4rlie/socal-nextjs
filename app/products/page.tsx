import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/product'

async function getProducts() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return products as Product[]
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Products</h1>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105">
              <div className="relative aspect-square">
                <Image
                  src={
                    product.custom_thumbnail_url || 
                    product.thumbnail_url || 
                    (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg')
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h2>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.retail_price?.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {product.availability_status}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600">No products found</h3>
          <p className="text-gray-500 mt-2">Please check back later for our latest products.</p>
        </div>
      )}
    </div>
  )
}
