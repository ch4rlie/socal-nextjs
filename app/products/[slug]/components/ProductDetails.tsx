'use client'

import { Product, ProductReview } from '@/types/product'
import { ProductGallery } from '@/components/product/product-gallery'
import { AddToCart } from '@/components/product/add-to-cart'
import { ShippingInfo } from '@/components/product/shipping-info'

interface Props {
  product: Product
  reviews: ProductReview[]
}

export default function ProductDetails({ product, reviews }: Props) {
  const handleAddToCart = async (quantity: number) => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', { product, quantity })
  }

  // Prepare images array for gallery
  const productImages = [
    product.thumbnail_url,
    product.custom_thumbnail_url,
    ...(product.images || []),
    ...(product.variants?.flatMap(variant => 
      variant.preview_image_url ? [variant.preview_image_url] : []
    ) || [])
  ]
    .filter(Boolean)
    .filter((url, index, self) => self.indexOf(url) === index) as string[]

  return (
    <div className="mx-auto max-w-7xl bg-white">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Product gallery */}
          <ProductGallery 
            images={productImages} 
            name={product.name} 
          />

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

            {/* Brand */}
            {product.brand && (
              <div className="mt-3">
                <h2 className="sr-only">Brand</h2>
                <p className="text-sm text-gray-600">{product.brand}</p>
              </div>
            )}

            {/* Description */}
            <div className="mt-6">
              <h2 className="sr-only">Product description</h2>
              <div className="space-y-6 text-base text-gray-700">
                {product.description}
              </div>
            </div>

            {/* Product specifications */}
            {(product.color || product.size || product.material) && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-sm font-medium text-gray-900">Specifications</h2>
                <div className="mt-4 space-y-4">
                  {product.color && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Color:</span> {product.color}
                    </p>
                  )}
                  {product.size && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Size:</span> {product.size}
                    </p>
                  )}
                  {product.material && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Material:</span> {product.material}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
              <div className="mt-10">
                <AddToCart 
                  productId={product.id}
                  name={product.name}
                  price={product.retail_price}
                  currency={product.currency}
                  availabilityStatus={product.availability_status}
                  product={product}
                />
                <ShippingInfo 
                  shippingType={product.shipping_type}
                  shippingRate={product.shipping_rate}
                  currency={product.currency}
                />
              </div>
            </div>

            {/* Reviews summary */}
            {reviews.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-lg font-medium text-gray-900">Customer Reviews</h2>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                  <div className="mt-2">
                    {/* Calculate average rating */}
                    {(() => {
                      const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
                      return (
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <svg
                                key={rating}
                                className={`h-5 w-5 ${
                                  rating < avgRating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 15.934l-6.18 3.254 1.18-6.883L.083 7.571l6.9-1.002L10 .333l3.017 6.236 6.9 1.002-4.917 4.734 1.18 6.883z"
                                />
                              </svg>
                            ))}
                          </div>
                          <p className="ml-2 text-sm text-gray-600">
                            {avgRating.toFixed(1)} out of 5 stars
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full reviews list */}
        {reviews.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
            <div className="mt-8 space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-8">
                  <div className="flex items-center">
                    {review.user?.avatar_url && (
                      <img
                        src={review.user.avatar_url}
                        alt={review.user.name || ''}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {review.user?.name || 'Anonymous'}
                      </h3>
                      <div className="mt-1 flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <svg
                            key={rating}
                            className={`h-4 w-4 ${
                              rating < review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15.934l-6.18 3.254 1.18-6.883L.083 7.571l6.9-1.002L10 .333l3.017 6.236 6.9 1.002-4.917 4.734 1.18 6.883z"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.review_title && (
                    <h4 className="mt-4 text-sm font-medium text-gray-900">
                      {review.review_title}
                    </h4>
                  )}
                  {review.review_text && (
                    <p className="mt-2 text-sm text-gray-600">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
