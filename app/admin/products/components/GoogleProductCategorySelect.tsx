'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { 
  GOOGLE_PRODUCT_CATEGORIES, 
  getChildCategories, 
  getCategoryHierarchy,
  searchCategories,
  type GoogleProductCategory 
} from '@/utils/googleProductCategories'

interface GoogleProductCategorySelectProps {
  value?: number
  onChange: (categoryId: number, categoryPath: string) => void
  onClose?: () => void
}

export default function GoogleProductCategorySelect({ 
  value, 
  onChange,
  onClose 
}: GoogleProductCategorySelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GoogleProductCategory | null>(null)
  const [categoryPath, setCategoryPath] = useState<GoogleProductCategory[]>([])
  const [searchResults, setSearchResults] = useState<GoogleProductCategory[]>([])

  useEffect(() => {
    if (value) {
      const hierarchy = getCategoryHierarchy(value)
      setCategoryPath(hierarchy)
      setSelectedCategory(hierarchy[hierarchy.length - 1] || null)
    }
  }, [value])

  function handleSearch(query: string) {
    setSearchQuery(query)
    if (query.trim()) {
      setSearchResults(searchCategories(query))
    } else {
      setSearchResults([])
    }
  }

  function handleCategorySelect(category: GoogleProductCategory) {
    setSelectedCategory(category)
    const hierarchy = getCategoryHierarchy(category.id)
    setCategoryPath(hierarchy)
    onChange(category.id, category.full_path)
    setSearchQuery('')
    setSearchResults([])
  }

  function handleBreadcrumbClick(index: number) {
    const newPath = categoryPath.slice(0, index + 1)
    setCategoryPath(newPath)
    setSelectedCategory(newPath[newPath.length - 1] || null)
  }

  const currentCategories = searchQuery
    ? searchResults
    : getChildCategories(selectedCategory?.id || null)

  return (
    <div className="space-y-4">
      <div className="relative">
        <FontAwesomeIcon 
          icon={faSearch} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size="sm"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>

      {categoryPath.length > 0 && !searchQuery && (
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
          {categoryPath.map((category, index) => (
            <div key={category.id} className="flex items-center">
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="hover:text-blue-600"
              >
                {category.name}
              </button>
              {index < categoryPath.length - 1 && (
                <FontAwesomeIcon 
                  icon={faChevronRight} 
                  className="mx-1 text-gray-400"
                  size="sm"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
        {currentCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
              selectedCategory?.id === category.id ? 'bg-blue-50' : ''
            }`}
          >
            <span>{category.name}</span>
            {!searchQuery && getChildCategories(category.id).length > 0 && (
              <FontAwesomeIcon 
                icon={faChevronRight} 
                className="text-gray-400"
                size="sm"
              />
            )}
          </button>
        ))}
        {currentCategories.length === 0 && (
          <div className="px-4 py-2 text-gray-500">
            {searchQuery ? 'No categories found' : 'No subcategories available'}
          </div>
        )}
      </div>

      {onClose && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
