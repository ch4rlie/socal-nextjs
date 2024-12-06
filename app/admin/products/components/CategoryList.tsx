'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTrash, faEdit, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

export default function CategoryList() {
  const { supabase } = useSupabase()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error

      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setNewCategory(false)
    setFormData({ name: '', description: '' })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name: formData.name,
              slug,
              description: formData.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])

        if (error) throw error
      }

      handleCancel()
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setNewCategory(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {newCategory && (
            <li className="px-4 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
            </li>
          )}
          {categories.map((category) => (
            <li key={category.id} className="px-4 py-4">
              {editingId === category.id ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Category Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="inline-flex items-center p-1.5 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
