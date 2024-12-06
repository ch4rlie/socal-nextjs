import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Providers } from './providers'
import { defaultMetadata } from './metadata'
import SupabaseProvider from './supabase-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = defaultMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* Remove the manual CSS link as it's already imported above */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={inter.className}>
        <SupabaseProvider>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Navigation />
              <main className="container mx-auto max-w-7xl flex-grow px-6 pt-16">
                {children}
              </main>
            </div>
          </Providers>
        </SupabaseProvider>
      </body>
    </html>
  )
}
