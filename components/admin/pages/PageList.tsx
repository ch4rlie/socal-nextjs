import { useState } from 'react'
import Link from 'next/link'
import { Page } from '@/types/pages'
import { formatDistanceToNow } from 'date-fns'

interface PageListProps {
  initialPages: Page[]
}

export default function PageList({ initialPages }: PageListProps) {
  const [pages] = useState<Page[]>(initialPages)

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="sm:flex sm:items-center p-6 pb-4">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Pages
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all pages in your website
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/admin/pages/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add page
          </Link>
        </div>
      </div>
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Last Updated
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Navigation
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                      {page.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="capitalize">{page.page_type}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          page.is_published
                            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                            : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                        }`}
                      >
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {[
                        page.show_in_header && 'Header',
                        page.show_in_footer && 'Footer',
                      ]
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
