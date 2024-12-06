'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPenToSquare, faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import type { Product, ProductVariant, ProductImage } from '@/utils/supabase'
import { upsertProduct, upsertProductVariant, deleteProductImage } from '@/utils/supabase'
import ImageUpload from './ImageUpload'
import SEOManager from './SEOManager'

interface ProductDetailsProps {
  product: Product & {
    product_variants: ProductVariant[]
    product_images: ProductImage[]
  }
  onClose: () => void
  onUpdate: () => void
}

export default function ProductDetails({ product, onClose, onUpdate }: ProductDetailsProps) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    retail_price: product.retail_price || 0,
  })
  const [activeTab, setActiveTab] = useState<'details' | 'variants' | 'images' | 'seo'>('details')

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)

      await upsertProduct({
        id: product.id,
        ...formData,
      })

      setEditMode(false)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageDelete(imageId: string) {
    try {
      await deleteProductImage(imageId)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Product Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'variants'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Variants
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'images'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'seo'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              SEO
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FontAwesomeIcon icon={editMode ? faSave : faPenToSquare} size="lg" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.retail_price}
                      onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={!editMode}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 ${
                        saving ? 'animate-pulse' : ''
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-4">
              {/* Variants */}
              <h3 className="text-lg font-medium">Variants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {product.product_variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="relative aspect-square mb-2">
                      {variant.custom_thumbnail_url || variant.thumbnail_url ? (
                        <Image
                          src={variant.custom_thumbnail_url || variant.thumbnail_url!}
                          alt={variant.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          No Image
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium">{variant.name}</h4>
                    {variant.size && <p className="text-sm text-gray-600">Size: {variant.size}</p>}
                    {variant.color && <p className="text-sm text-gray-600">Color: {variant.color}</p>}
                    <p className="text-sm font-medium">${variant.retail_price}</p>
                    <ImageUpload
                      onUpload={async (file) => {
                        const path = `${product.id}/${variant.id}/${file.name}`
                        const { path: storagePath } = await uploadProductImage(file, path)
                        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
                        
                        await upsertProductVariant({
                          id: variant.id,
                          custom_thumbnail_url: publicUrl,
                        })
                        
                        onUpdate()
                      }}
                      onCancel={() => {}}
                      uploading={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              {/* Additional Images */}
              <h3 className="text-lg font-medium">Additional Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.product_images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="relative aspect-square">
                      <Image
                        src={image.custom_image_url || image.image_url}
                        alt="Product image"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <button
                      onClick={() => handleImageDelete(image.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FontAwesomeIcon icon={faTrashCan} size="sm" />
                    </button>
                  </div>
                ))}
                <div className="border-2 border-dashed border-gray-300 rounded aspect-square flex items-center justify-center">
                  <ImageUpload
                    onUpload={async (file) => {
                      const path = `${product.id}/additional/${file.name}`
                      const { path: storagePath } = await uploadProductImage(file, path)
                      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
                      
                      await upsertProductImage({
                        product_id: product.id,
                        image_url: publicUrl,
                        position: product.product_images.length,
                      })
                      
                      onUpdate()
                    }}
                    onCancel={() => {}}
                    uploading={false}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <SEOManager product={product} onUpdate={onUpdate} />
          )}
        </div>

        {error && (
          <div className="px-6 pb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
