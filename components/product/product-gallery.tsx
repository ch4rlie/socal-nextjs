'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface Props {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-h-1 aspect-w-1 w-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  const next = () => {
    setSelectedImage((selectedImage + 1) % images.length)
  }

  const previous = () => {
    setSelectedImage((selectedImage - 1 + images.length) % images.length)
  }

  return (
    <div className="product-gallery">
      {/* Image grid */}
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          <div className="thumbnail-grid" role="tablist">
            {images.map((image, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`thumbnail-item ${selectedImage === i ? 'selected' : ''}`}
                role="tab"
                aria-selected={selectedImage === i}
                aria-label={`Image ${i + 1} of ${images.length}`}
              >
                <div className="thumbnail-image-container">
                  <Image
                    src={image}
                    alt={`${name} - View ${i + 1}`}
                    width={200}
                    height={200}
                    className="thumbnail-image"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main image */}
      <div className="gallery-main">
        <Image
          src={images[selectedImage]}
          alt={`${name} - Main Image`}
          width={800}
          height={800}
          className="h-full w-full object-contain"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={previous}
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-900" />
            </button>
            <button
              className="absolute right-4 top-1/2 -mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-900" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
