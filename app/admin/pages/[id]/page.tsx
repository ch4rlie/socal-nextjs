import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PageEditor from '@/components/admin/pages/PageEditor'
import AdminLayout from '@/components/admin/AdminLayout'
import type { Page } from '@/types/pages'

export default async function EditPagePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: role } = await supabase.rpc('get_user_role', {
    user_id: session.user.id,
  })

  if (role !== 'staff') {
    redirect('/')
  }

  const { data: page } = await supabase
    .from('pages')
    .select(`
      *,
      page_sections (
        *,
        faq_items (*)
      )
    `)
    .eq('id', params.id)
    .single()

  if (!page) {
    redirect('/admin/pages')
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Page</h1>
        </div>
        <PageEditor initialPage={page as Page} />
      </div>
    </AdminLayout>
  )
}
