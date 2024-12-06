import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/product'
import { formatCurrency } from '@/utils/currency'

interface Props {
  products: Product[]
}

export function ProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          className="group relative"
        >
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={500}
                height={500}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            )}
          </div>
          <div className="mt-4 flex justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.category_path?.[0]}</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(product.price)}
            </p>
          </div>
          {!product.in_stock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
              Out of Stock
            </div>
          )}
          {product.sale_price && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
              Sale
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
