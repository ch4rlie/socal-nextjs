import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const siteConfig = {
  name: 'SoCal Prerunner',
  description: 'Premium California-inspired apparel and accessories.',
  url: baseUrl,
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@socalprerunner',
  },
  robots: {
    index: true,
    follow: true,
  },
}
