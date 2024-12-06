import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProductList from './components/ProductList'

export default async function AdminProductsPage() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Debug log
    console.log('Supabase client created with:', {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    
    // Check if user is authenticated and has admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error getting user:', userError);
      redirect('/login');
    }

    if (!user) {
      console.log('No user found, redirecting to login');
      redirect('/login')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error getting profile:', profileError);
      redirect('/');
    }

    if (profile?.role !== 'admin') {
      console.log('User is not admin, redirecting to home');
      redirect('/')
    }

    // Test database connection
    const { data: test, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Database connection test failed:', testError);
      throw new Error('Failed to connect to database');
    }

    console.log('Database connection test successful');

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Product Management</h1>
        <ProductList />
      </div>
    )
  } catch (err) {
    console.error('Error in AdminProductsPage:', err);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Product Management</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          An error occurred while loading the admin page. Please try refreshing the page.
        </div>
      </div>
    )
  }
}
