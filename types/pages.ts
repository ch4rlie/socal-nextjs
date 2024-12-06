import { Database } from './database'

export type PageType = 'policy' | 'legal' | 'support' | 'about' | 'custom'
export type SectionType = 'text' | 'html' | 'markdown' | 'contact_form' | 'faq' | 'image_gallery' | 'video' | 'custom'

export interface Page {
  id: string
  created_at: string
  updated_at: string
  title: string
  slug: string
  content: string
  meta_title?: string
  meta_description?: string
  is_published: boolean
  publish_date?: string
  author_id?: string
  last_edited_by?: string
  page_type: PageType
  show_in_footer: boolean
  show_in_header: boolean
  footer_order?: number
  header_order?: number
  parent_page_id?: string
  is_searchable: boolean
  requires_auth: boolean
  custom_css?: string
  custom_js?: string
  version: number
  metadata?: Record<string, any>
}

export interface PageRevision {
  id: string
  page_id: string
  created_at: string
  content: string
  title: string
  meta_title?: string
  meta_description?: string
  edited_by?: string
  version: number
  change_summary?: string
  metadata?: Record<string, any>
}

export interface PageSection {
  id: string
  page_id: string
  created_at: string
  updated_at: string
  title?: string
  content: string
  section_type: SectionType
  sort_order: number
  is_visible: boolean
  metadata?: Record<string, any>
}

export interface FAQItem {
  id: string
  section_id: string
  created_at: string
  updated_at: string
  question: string
  answer: string
  sort_order: number
  is_visible: boolean
  metadata?: Record<string, any>
}

// Update Database interface
declare module './database' {
  interface Database {
    public: {
      Tables: {
        pages: {
          Row: Page
          Insert: Omit<Page, 'id' | 'created_at' | 'updated_at'>
          Update: Partial<Omit<Page, 'id'>>
        }
        page_revisions: {
          Row: PageRevision
          Insert: Omit<PageRevision, 'id' | 'created_at'>
          Update: Partial<Omit<PageRevision, 'id'>>
        }
        page_sections: {
          Row: PageSection
          Insert: Omit<PageSection, 'id' | 'created_at' | 'updated_at'>
          Update: Partial<Omit<PageSection, 'id'>>
        }
        faq_items: {
          Row: FAQItem
          Insert: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>
          Update: Partial<Omit<FAQItem, 'id'>>
        }
      }
    }
  }
}
