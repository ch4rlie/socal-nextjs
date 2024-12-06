'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/utils/currency'
import Link from 'next/link'
import { useSupabase } from '@/app/supabase-provider'

export default function AdminDashboard() {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')

      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      setStats({
        totalProducts: productsCount || 0,
        totalOrders,
        totalRevenue,
      })
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalProducts}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalOrders}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/products/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/printful"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Printful Integration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
