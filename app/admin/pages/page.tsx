import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PageList from '@/components/admin/pages/PageList'
import AdminLayout from '@/components/admin/AdminLayout'

export default async function AdminPagesPage() {
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

  const { data: pages } = await supabase
    .from('pages')
    .select(`
      *,
      page_sections (
        *,
        faq_items (*)
      )
    `)
    .order('updated_at', { ascending: false })

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pages</h1>
        </div>
        <PageList initialPages={pages || []} />
      </div>
    </AdminLayout>
  )
}
