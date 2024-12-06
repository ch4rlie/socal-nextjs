'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSync } from '@fortawesome/free-solid-svg-icons'
import { syncPrintfulProduct } from '@/utils/supabase'
import { getPrintfulProducts } from '@/utils/printful'

interface AdminHeaderProps {
  onSearch: (query: string) => void
  onRefresh: () => Promise<void>
}

export default function AdminHeader({ onSearch, onRefresh }: AdminHeaderProps) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSync() {
    try {
      setSyncing(true)
      setError(null)
      
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SYNC_API_KEY}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to sync products')
      }
      
      // Refresh the product list
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync products')
      console.error('Sync error:', err)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              syncing ? 'animate-pulse' : ''
            }`}
          >
            <FontAwesomeIcon icon={faSync} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing with Printful...' : 'Sync with Printful'}
          </button>
        </div>
        
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size="sm"
          />
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
