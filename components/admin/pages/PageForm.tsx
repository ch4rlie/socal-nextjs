import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Editor from '@/components/editor/Editor'
import type { Page } from '@/types/pages'

interface PageFormProps {
  initialData?: Page
  isEditing?: boolean
}

export default function PageForm({ initialData, isEditing }: PageFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    page_type: initialData?.page_type || 'custom',
    requires_auth: initialData?.requires_auth || false,
    is_published: initialData?.is_published || false,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    custom_css: initialData?.custom_css || '',
    custom_js: initialData?.custom_js || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      updated_at: new Date().toISOString(),
    }

    if (isEditing && initialData?.id) {
      const { error } = await supabase
        .from('pages')
        .update(data)
        .eq('id', initialData.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('pages').insert([data])
      if (error) throw error
    }

    router.push('/admin/pages')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700"
          >
            Slug
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <div className="mt-1">
            <Editor
              content={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="page_type"
            className="block text-sm font-medium text-gray-700"
          >
            Page Type
          </label>
          <select
            id="page_type"
            name="page_type"
            value={formData.page_type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, page_type: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="custom">Custom</option>
            <option value="policy">Policy</option>
            <option value="legal">Legal</option>
            <option value="support">Support</option>
            <option value="about">About</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="requires_auth"
            name="requires_auth"
            type="checkbox"
            checked={formData.requires_auth}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                requires_auth: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="requires_auth"
            className="ml-2 block text-sm text-gray-900"
          >
            Requires Authentication
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            checked={formData.is_published}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_published: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="is_published"
            className="ml-2 block text-sm text-gray-900"
          >
            Published
          </label>
        </div>

        <div>
          <label
            htmlFor="meta_title"
            className="block text-sm font-medium text-gray-700"
          >
            Meta Title
          </label>
          <input
            type="text"
            name="meta_title"
            id="meta_title"
            value={formData.meta_title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="meta_description"
            className="block text-sm font-medium text-gray-700"
          >
            Meta Description
          </label>
          <textarea
            name="meta_description"
            id="meta_description"
            rows={3}
            value={formData.meta_description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                meta_description: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="custom_css"
            className="block text-sm font-medium text-gray-700"
          >
            Custom CSS
          </label>
          <textarea
            name="custom_css"
            id="custom_css"
            rows={4}
            value={formData.custom_css}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, custom_css: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
          />
        </div>

        <div>
          <label
            htmlFor="custom_js"
            className="block text-sm font-medium text-gray-700"
          >
            Custom JavaScript
          </label>
          <textarea
            name="custom_js"
            id="custom_js"
            rows={4}
            value={formData.custom_js}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, custom_js: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isEditing ? 'Update Page' : 'Create Page'}
        </button>
      </div>
    </form>
  )
}
