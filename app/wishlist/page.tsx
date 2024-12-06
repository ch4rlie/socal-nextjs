'use client'

import { useWishlistStore } from '@/stores/wishlistStore'
import { useCartStore } from '@/stores/cartStore'
import { ProductGrid } from '@/components/product/product-grid'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
        <p className="mt-4">Save items you want to buy later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Wishlist</h1>
      <ProductGrid products={items} />
    </div>
  )
}
