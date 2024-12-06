'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSync, 
  faTrash, 
  faExclamationTriangle,
  faSpinner,
  faCheck,
  faImage
} from '@fortawesome/free-solid-svg-icons'

export default function PrintfulDashboard() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [syncStats, setSyncStats] = useState({
    added: 0,
    updated: 0,
    skipped: 0,
  })

  const handlePrintfulSync = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSyncStats({ added: 0, updated: 0, skipped: 0 })

    try {
      // Call your API endpoint that handles Printful sync
      const response = await fetch('/api/admin/printful/sync', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const result = await response.json()
      setSyncStats(result.stats)
      setSuccess('Sync completed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync with Printful')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllProducts = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL products from your database. This action cannot be undone. Are you absolutely sure?')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // First, delete all product variants
      const { data: variants, error: variantError } = await supabase
        .from('product_variants')
        .delete()
        .select()

      if (variantError) {
        console.error('Error deleting variants:', variantError)
        throw new Error(`Failed to delete product variants: ${variantError.message}`)
      }

      console.log(`Deleted ${variants?.length || 0} variants`)

      // Then, delete all products
      const { data: products, error: productError } = await supabase
        .from('products')
        .delete()
        .select()

      if (productError) {
        console.error('Error deleting products:', productError)
        throw new Error(`Failed to delete products: ${productError.message}`)
      }

      console.log(`Deleted ${products?.length || 0} products`)
      setSuccess(`Successfully deleted ${products?.length || 0} products and ${variants?.length || 0} variants.`)
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete products')
    } finally {
      setLoading(false)
    }
  }

  const handlePreserveCustomImages = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Get all products with custom images
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, custom_images')
        .not('custom_images', 'is', null)

      if (fetchError) throw fetchError

      // Store the mapping of product IDs to custom images
      const { error: storeError } = await supabase
        .from('custom_image_backup')
        .insert(
          products?.map(product => ({
            product_id: product.id,
            custom_images: product.custom_images,
            created_at: new Date().toISOString()
          })) || []
        )

      if (storeError) throw storeError

      setSuccess('Custom images have been preserved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preserve custom images')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Stats */}
      {(syncStats.added > 0 || syncStats.updated > 0 || syncStats.skipped > 0) && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Sync Results</h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Products Added</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{syncStats.added}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Products Updated</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{syncStats.updated}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Products Skipped</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{syncStats.skipped}</dd>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Sync Tools</h3>
          <div className="mt-5 space-y-4">
            <button
              onClick={handlePrintfulSync}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <FontAwesomeIcon icon={faSync} className="mr-2 h-4 w-4" />
              )}
              Sync with Printful
            </button>

            <button
              onClick={handlePreserveCustomImages}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <FontAwesomeIcon icon={faImage} className="mr-2 h-4 w-4" />
              )}
              Preserve Custom Images
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 text-red-600">Danger Zone</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>These actions cannot be undone. Please be certain.</p>
          </div>
          <div className="mt-5">
            <button
              onClick={handleDeleteAllProducts}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
              )}
              Delete All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
