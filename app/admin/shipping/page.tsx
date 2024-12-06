'use client'

import { useEffect, useState } from 'react'
import { ShippingRate } from '@/types/shipping'
import { ShippingRatesTable } from './components/shipping-rates-table'
import { toast } from 'sonner'

export default function ShippingAdmin() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/shipping')
      if (!response.ok) throw new Error('Failed to fetch shipping rates')
      
      const data = await response.json()
      setRates(data)
    } catch (error) {
      console.error('Error fetching shipping rates:', error)
      toast.error('Failed to fetch shipping rates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-spinner fa-spin text-xl" />
          <span>Loading shipping rates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Shipping Management</h1>
          <p className="text-gray-600">
            Manage shipping rates for different product categories and regions.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <ShippingRatesTable rates={rates} onRateChange={fetchRates} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Shipping Rate Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Shirts */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">Basic Shirts</h3>
              <p className="text-sm text-gray-600">
                T-shirts, tank tops, polo shirts, etc.
              </p>
            </div>

            {/* Heavy Outerwear */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">Heavy Outerwear</h3>
              <p className="text-sm text-gray-600">
                Hoodies, sweatshirts, jackets
              </p>
            </div>

            {/* All-Over Print Light */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">All-Over Print Light</h3>
              <p className="text-sm text-gray-600">
                AOP shirts, leggings, dresses
              </p>
            </div>

            {/* All-Over Print Heavy */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">All-Over Print Heavy</h3>
              <p className="text-sm text-gray-600">
                AOP hoodies, sweatshirts
              </p>
            </div>

            {/* All-Over Print Premium */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">All-Over Print Premium</h3>
              <p className="text-sm text-gray-600">
                AOP windbreakers, track pants
              </p>
            </div>

            {/* Headwear */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">Headwear</h3>
              <p className="text-sm text-gray-600">
                Hats, caps, beanies, visors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
