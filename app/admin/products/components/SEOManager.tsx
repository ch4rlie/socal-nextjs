'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faXmark, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Product } from '@/utils/supabase'
import { upsertProduct } from '@/utils/supabase'
import { getGoogleProductCategoryById } from '@/utils/googleProductCategories'
import GoogleProductCategorySelect from './GoogleProductCategorySelect'

interface SEOManagerProps {
  product: Product
  onUpdate: () => void
}

export default function SEOManager({ product, onUpdate }: SEOManagerProps) {
  const [formData, setFormData] = useState({
    meta_title: product.meta_title || '',
    meta_description: product.meta_description || '',
    meta_keywords: product.meta_keywords || [],
    canonical_url: product.canonical_url || '',
    og_title: product.og_title || '',
    og_description: product.og_description || '',
    og_image_url: product.og_image_url || '',
    google_product_category: product.google_product_category || '',
    google_product_category_id: product.google_product_category_id || null,
    structured_data: product.structured_data || {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.thumbnail_url,
      "category": product.google_product_category || '',
      "offers": {
        "@type": "Offer",
        "price": product.retail_price,
        "priceCurrency": product.currency
      }
    },
    slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  })

  const [newKeyword, setNewKeyword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCategorySelect, setShowCategorySelect] = useState(false)

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)

      await upsertProduct({
        id: product.id,
        ...formData,
      })

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save SEO data')
    } finally {
      setSaving(false)
    }
  }

  function addKeyword() {
    if (!newKeyword.trim()) return
    setFormData(prev => ({
      ...prev,
      meta_keywords: [...(prev.meta_keywords || []), newKeyword.trim()]
    }))
    setNewKeyword('')
  }

  function removeKeyword(index: number) {
    setFormData(prev => ({
      ...prev,
      meta_keywords: prev.meta_keywords?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">SEO Settings</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 ${
            saving ? 'animate-pulse' : ''
          }`}
        >
          {saving ? 'Saving...' : 'Save SEO Settings'}
          <FontAwesomeIcon icon={faSave} size="lg" className="ml-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Title
          </label>
          <input
            type="text"
            value={formData.meta_title}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Product meta title"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.meta_title.length}/60 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="product-url-slug"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
          </label>
          <textarea
            value={formData.meta_description}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Product meta description"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.meta_description.length}/160 characters
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Keywords
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              className="flex-1 px-3 py-2 border rounded-md"
              placeholder="Add keyword"
            />
            <button
              onClick={addKeyword}
              className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} size="lg" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.meta_keywords?.map((keyword, index) => (
              <span
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(index)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <FontAwesomeIcon icon={faXmark} size="sm" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Canonical URL
          </label>
          <input
            type="text"
            value={formData.canonical_url}
            onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://example.com/products/product-name"
          />
        </div>

        <div className="border-t md:col-span-2 pt-4">
          <h4 className="font-medium mb-4">Google Product Category</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Select a category that best describes your product. This helps improve your product's visibility in Google Shopping and enhances the structured data.
            </p>
            {formData.google_product_category ? (
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded">
                <span>{formData.google_product_category}</span>
                <button
                  onClick={() => setShowCategorySelect(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCategorySelect(true)}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400"
              >
                Select Category
              </button>
            )}
          </div>

          {showCategorySelect && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <h3 className="text-lg font-medium mb-4">Select Google Product Category</h3>
                <GoogleProductCategorySelect
                  value={formData.google_product_category_id}
                  onChange={(categoryId, categoryPath) => {
                    setFormData(prev => ({
                      ...prev,
                      google_product_category: categoryPath,
                      google_product_category_id: categoryId,
                      structured_data: {
                        ...prev.structured_data,
                        category: categoryPath
                      }
                    }))
                    setShowCategorySelect(false)
                  }}
                  onClose={() => setShowCategorySelect(false)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t md:col-span-2 pt-4">
          <h4 className="font-medium mb-4">Open Graph Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG Title
              </label>
              <input
                type="text"
                value={formData.og_title}
                onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Open Graph title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG Description
              </label>
              <textarea
                value={formData.og_description}
                onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Open Graph description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG Image URL
              </label>
              <input
                type="text"
                value={formData.og_image_url}
                onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://example.com/images/product.jpg"
              />
            </div>
          </div>
        </div>

        <div className="border-t md:col-span-2 pt-4">
          <h4 className="font-medium mb-4">Structured Data</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JSON-LD
            </label>
            <textarea
              value={JSON.stringify(formData.structured_data, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  setFormData({ ...formData, structured_data: parsed })
                } catch (err) {
                  // Allow invalid JSON while typing
                }
              }}
              rows={10}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm"
              placeholder="Structured data in JSON-LD format"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  )
}
