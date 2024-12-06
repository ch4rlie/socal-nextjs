import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Page } from '@/types/pages'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get the page data
  const { data: page } = await supabase
    .from('pages')
    .select(`
      *,
      page_sections (
        *,
        faq_items (*)
      )
    `)
    .eq('slug', params.slug)
    .single()

  if (!page) {
    notFound()
  }

  const typedPage = page as Page & {
    page_sections: Array<{
      id: string
      content: string
      section_type: string
      sort_order: number
      faq_items?: Array<{
        id: string
        question: string
        answer: string
        sort_order: number
      }>
    }>
  }

  // Check if the page requires authentication
  if (typedPage.requires_auth) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return (
        <div className="min-h-screen bg-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Authentication Required
              </h1>
              <p className="text-gray-600">
                Please sign in to view this page.
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Add custom CSS if provided */}
      {typedPage.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: typedPage.custom_css }} />
      )}

      {/* Add custom JS if provided */}
      {typedPage.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: typedPage.custom_js }} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{typedPage.title}</h1>
        </header>

        <div className="prose max-w-none">
          {/* Render page sections in order */}
          {typedPage.page_sections
            ?.sort((a, b) => a.sort_order - b.sort_order)
            .map((section) => {
              switch (section.section_type) {
                case 'text':
                case 'html':
                case 'markdown':
                  return (
                    <div
                      key={section.id}
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  )
                case 'faq':
                  return (
                    <div key={section.id} className="not-prose">
                      <div className="divide-y divide-gray-200">
                        {section.faq_items
                          ?.sort((a, b) => a.sort_order - b.sort_order)
                          .map((item) => (
                            <div key={item.id} className="py-6">
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.question}
                              </h3>
                              <div
                                className="mt-2 text-base text-gray-500"
                                dangerouslySetInnerHTML={{ __html: item.answer }}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                case 'contact_form':
                  return (
                    <div key={section.id} className="not-prose">
                      {/* Add your contact form component here */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                          Contact Us
                        </h2>
                        {/* Add contact form fields */}
                      </div>
                    </div>
                  )
                default:
                  return null
              }
            })}
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: page } = await supabase
    .from('pages')
    .select('title, meta_title, meta_description')
    .eq('slug', params.slug)
    .single()

  if (!page) {
    return {}
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description,
  }
}
