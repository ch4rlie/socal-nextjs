import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PageForm from '@/components/admin/pages/PageForm'

export default async function NewPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated and is staff
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_staff')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_staff) {
    redirect('/')
  }

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Create New Page
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <PageForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
