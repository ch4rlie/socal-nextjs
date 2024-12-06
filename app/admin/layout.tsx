'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faBox, 
  faShoppingCart, 
  faCog, 
  faUsers, 
  faChartLine,
  faSync,
  faPlus,
  faList,
  faLayerGroup,
  faClipboardList,
  faCheckCircle,
  faSpinner,
  faWrench
} from '@fortawesome/free-solid-svg-icons'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: faHome },
  { 
    name: 'Products',
    href: '/admin/products',
    icon: faBox,
    children: [
      { name: 'All Products', href: '/admin/products', icon: faList },
      { name: 'Add Product', href: '/admin/products/new', icon: faPlus },
      { name: 'Categories', href: '/admin/products/categories', icon: faLayerGroup },
    ]
  },
  { 
    name: 'Orders',
    href: '/admin/orders',
    icon: faShoppingCart,
    children: [
      { name: 'All Orders', href: '/admin/orders', icon: faClipboardList },
      { name: 'Pending', href: '/admin/orders/pending', icon: faSpinner },
      { name: 'Completed', href: '/admin/orders/completed', icon: faCheckCircle },
    ]
  },
  { 
    name: 'Printful',
    href: '/admin/printful',
    icon: faSync,
    children: [
      { name: 'Sync Products', href: '/admin/printful/sync', icon: faSync },
      { name: 'Sync Status', href: '/admin/printful/status', icon: faSpinner },
      { name: 'Settings', href: '/admin/printful/settings', icon: faWrench },
    ]
  },
  { name: 'Customers', href: '/admin/customers', icon: faUsers },
  { name: 'Analytics', href: '/admin/analytics', icon: faChartLine },
  { name: 'Settings', href: '/admin/settings', icon: faCog },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
            <div className="flex flex-shrink-0 items-center px-4">
              <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
            </div>
            <div className="mt-5 flex flex-grow flex-col">
              <nav className="flex-1 space-y-1 px-2 pb-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.children && item.children.some(child => pathname === child.href))
                  
                  return (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                        )}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={classNames(
                            isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                            'mr-3 h-5 w-5'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                      {item.children && (
                        <div className="space-y-1 pl-10">
                          {item.children.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={classNames(
                                pathname === subItem.href
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                              )}
                            >
                              <FontAwesomeIcon
                                icon={subItem.icon}
                                className={classNames(
                                  pathname === subItem.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                  'mr-3 h-4 w-4'
                                )}
                                aria-hidden="true"
                              />
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
