import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Pages', href: '/admin/pages' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Settings', href: '/admin/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-900">
                  SoCal Admin
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
