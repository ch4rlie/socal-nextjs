'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProducts } from '@/utils/supabase'
import type { Product } from '@/utils/supabase'
import ProductCard from './ProductCard'
import ProductDetails from './ProductDetails'
import AdminHeader from './AdminHeader'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const products = await getProducts()
      setProducts(products)
      setFilteredProducts(products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredProducts(products)
      return
    }

    const searchTerms = debouncedSearch.toLowerCase().split(' ')
    const filtered = products.filter(product => {
      const searchString = `${product.name} ${product.description || ''} ${
        product.product_variants?.map(v => `${v.name} ${v.size} ${v.color}`).join(' ') || ''
      }`.toLowerCase()
      
      return searchTerms.every(term => searchString.includes(term))
    })

    setFilteredProducts(filtered)
  }, [debouncedSearch, products])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminHeader onSearch={setSearchQuery} onRefresh={loadProducts} />
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminHeader onSearch={setSearchQuery} onRefresh={loadProducts} />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader onSearch={setSearchQuery} onRefresh={loadProducts} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onClick={() => setSelectedProduct(product)}
            onUpdate={loadProducts}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products found matching your search.
        </div>
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={() => {
            loadProducts()
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}
