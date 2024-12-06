'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/supabase-provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface ProductVariant {
  name: string
  size: string
  color: string
  price: number
  stock: number
}

export default function AddProductForm() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([{ 
    name: '', 
    size: '', 
    color: '', 
    price: 0, 
    stock: 0 
  }])

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    featured: false,
    active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Insert the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([
          {
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (productError) throw productError

      // Insert the variants
      if (product) {
        const variantsWithProductId = variants.map(variant => ({
          ...variant,
          product_id: product.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsWithProductId)

        if (variantError) throw variantError
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const addVariant = () => {
    setVariants([...variants, { name: '', size: '', color: '', price: 0, stock: 0 }])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={productData.name}
            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={productData.description}
            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            id="category"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={productData.category}
            onChange={(e) => setProductData({ ...productData, category: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={productData.featured}
              onChange={(e) => setProductData({ ...productData, featured: e.target.checked })}
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Featured Product
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={productData.active}
              onChange={(e) => setProductData({ ...productData, active: e.target.checked })}
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variant Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                  />
                </div>
              </div>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Remove Variant
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            'Save Product'
          )}
        </button>
      </div>
    </form>
  )
}
