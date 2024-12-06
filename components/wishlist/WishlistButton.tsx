'use client'

import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useWishlistStore } from '@/stores/wishlistStore'
import { Product } from '@/types/product'

interface Props {
  product: Product
}

export function WishlistButton({ product }: Props) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeItem(product.id)
    } else {
      addItem(product)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      className={`rounded-full p-2 ${
        isWishlisted
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-gray-500'
      }`}
    >
      <span className="sr-only">
        {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      </span>
      {isWishlisted ? (
        <HeartIconSolid className="h-6 w-6" aria-hidden="true" />
      ) : (
        <HeartIcon className="h-6 w-6" aria-hidden="true" />
      )}
    </button>
  )
}
