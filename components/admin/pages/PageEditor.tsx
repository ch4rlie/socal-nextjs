import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'
import type { Page, PageSection, SectionType, PageType } from '@/types/pages'

const Editor = dynamic(() => import('@/components/editor/Editor'), { ssr: false })

interface PageEditorProps {
  initialPage: Page
}

const pageTypes: PageType[] = ['policy', 'legal', 'support', 'about', 'custom']
const sectionTypes: SectionType[] = [
  'text',
  'html',
  'markdown',
  'contact_form',
  'faq',
  'image_gallery',
  'video',
  'custom',
]

export default function PageEditor({ initialPage }: PageEditorProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [page, setPage] = useState<Page>(initialPage)
  const [sections, setSections] = useState<PageSection[]>(
    initialPage.page_sections || []
  )
  const [saving, setSaving] = useState(false)

  const handlePageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setPage((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSectionChange = (index: number, content: string) => {
    setSections((prev) => {
      const newSections = [...prev]
      newSections[index] = { ...newSections[index], content }
      return newSections
    })
  }

  const addSection = (type: SectionType) => {
    setSections((prev) => [
      ...prev,
      {
        id: '', // Will be set by the database
        page_id: page.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        content: '',
        section_type: type,
        sort_order: prev.length,
        is_visible: true,
      },
    ])
  }

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  const savePage = async () => {
    setSaving(true)
    try {
      // Update page
      const { error: pageError } = await supabase
        .from('pages')
        .update({
          title: page.title,
          slug: page.slug,
          content: page.content,
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          is_published: page.is_published,
          page_type: page.page_type,
          show_in_footer: page.show_in_footer,
          show_in_header: page.show_in_header,
          footer_order: page.footer_order,
          header_order: page.header_order,
          requires_auth: page.requires_auth,
          is_searchable: page.is_searchable,
          custom_css: page.custom_css,
          custom_js: page.custom_js,
        })
        .eq('id', page.id)

      if (pageError) throw pageError

      // Update sections
      for (const section of sections) {
        if (!section.id) {
          // Create new section
          const { error } = await supabase.from('page_sections').insert({
            page_id: page.id,
            content: section.content,
            section_type: section.section_type,
            sort_order: section.sort_order,
            is_visible: section.is_visible,
          })
          if (error) throw error
        } else {
          // Update existing section
          const { error } = await supabase
            .from('page_sections')
            .update({
              content: section.content,
              section_type: section.section_type,
              sort_order: section.sort_order,
              is_visible: section.is_visible,
            })
            .eq('id', section.id)
          if (error) throw error
        }
      }

      router.refresh()
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Error saving page')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Basic Information */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={page.title}
              onChange={handlePageChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={page.slug}
              onChange={handlePageChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Page Type
            </label>
            <select
              name="page_type"
              value={page.page_type}
              onChange={handlePageChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {pageTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">SEO</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meta Title
            </label>
            <input
              type="text"
              name="meta_title"
              value={page.meta_title || ''}
              onChange={handlePageChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              value={page.meta_description || ''}
              onChange={handlePageChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="show_in_header"
                  checked={page.show_in_header}
                  onChange={handlePageChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show in Header</span>
              </label>
              {page.show_in_header && (
                <input
                  type="number"
                  name="header_order"
                  value={page.header_order || 0}
                  onChange={handlePageChange}
                  className="ml-4 w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="show_in_footer"
                  checked={page.show_in_footer}
                  onChange={handlePageChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show in Footer</span>
              </label>
              {page.show_in_footer && (
                <input
                  type="number"
                  name="footer_order"
                  value={page.footer_order || 0}
                  onChange={handlePageChange}
                  className="ml-4 w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Content Sections</h2>
          <div className="flex space-x-2">
            <select
              onChange={(e) => addSection(e.target.value as SectionType)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Add Section
              </option>
              {sectionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id || index}
              className="border border-gray-200 rounded-md p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 capitalize">
                  {section.section_type} Section
                </h3>
                <button
                  onClick={() => removeSection(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              <Editor
                content={section.content}
                onChange={(content) => handleSectionChange(index, content)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={page.is_published}
                onChange={handlePageChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Published</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="requires_auth"
                checked={page.requires_auth}
                onChange={handlePageChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Requires Authentication
              </span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="is_searchable"
                checked={page.is_searchable}
                onChange={handlePageChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Searchable</span>
            </label>
          </div>
        </div>
      </div>

      {/* Custom Code */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Custom Code</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Custom CSS
            </label>
            <textarea
              name="custom_css"
              value={page.custom_css || ''}
              onChange={handlePageChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Custom JavaScript
            </label>
            <textarea
              name="custom_js"
              value={page.custom_js || ''}
              onChange={handlePageChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={savePage}
          disabled={saving}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
