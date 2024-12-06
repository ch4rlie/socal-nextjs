'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/utils/supabase'
import { upsertProduct, uploadProductImage } from '@/utils/supabase'
import ImageUpload from './ImageUpload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faImage } from '@fortawesome/free-solid-svg-icons'

interface ProductCardProps {
  product: Product
  onClick: () => void
  onUpdate: () => void
}

export default function ProductCard({ product, onClick, onUpdate }: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImageUpload(file: File) {
    try {
      setUploading(true)
      setError(null)

      // Upload image to Supabase Storage
      const path = `${product.id}/${file.name}`
      const { path: storagePath } = await uploadProductImage(file, path)
      
      // Get the public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
      
      // Update product with new custom thumbnail
      await upsertProduct({
        id: product.id,
        custom_thumbnail_url: publicUrl,
      })

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      setIsEditing(false)
    }
  }

  const displayImage = product.custom_thumbnail_url || product.thumbnail_url

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
      <div 
        className="relative aspect-square cursor-pointer group"
        onClick={onClick}
      >
        {displayImage ? (
          <>
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <FontAwesomeIcon 
                icon={faPenToSquare} 
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                size="lg"
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <FontAwesomeIcon 
              icon={faImage} 
              className="text-gray-400"
              size="3x"
            />
          </div>
        )}

        {product.product_variants && (
          <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-sm font-medium">
            {product.product_variants.length} variants
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        
        <div className="space-y-2">
          {isEditing ? (
            <ImageUpload 
              onUpload={handleImageUpload}
              onCancel={() => setIsEditing(false)}
              uploading={uploading}
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {product.custom_thumbnail_url ? 'Change Custom Image' : 'Add Custom Image'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {product.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            ${product.retail_price?.toFixed(2)}
          </span>
          <span className="text-gray-500">
            {product.product_images?.length || 0} images
          </span>
        </div>
      </div>
    </div>
  )
}
