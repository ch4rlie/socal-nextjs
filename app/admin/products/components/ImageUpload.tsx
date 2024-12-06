'use client'

import { useRef, useState } from 'react'

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>
  onCancel: () => void
  uploading: boolean
}

export default function ImageUpload({ onUpload, onCancel, uploading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setSelectedFile(file)
  }

  async function handleUpload() {
    if (!selectedFile) return
    await onUpload(selectedFile)
    setSelectedFile(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded"
          />
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          Click to select image
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            uploading ? 'animate-pulse' : ''
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        
        <button
          onClick={() => {
            setSelectedFile(null)
            setPreview(null)
            onCancel()
          }}
          disabled={uploading}
          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
