import { Metadata } from 'next'

interface MetadataParams {
  title: string
  description: string
  images?: string[]
  canonical?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  keywords?: string[]
  category?: string
}

export function generateMetadata({
  title,
  description,
  images = [],
  canonical,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors = [],
  keywords = [],
  category,
}: MetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const siteName = 'SoCal Shop'
  
  // Ensure we have at least one image
  const defaultImage = `${baseUrl}/images/default-og.jpg`
  const imageUrls = images.length > 0 ? images : [defaultImage]
  
  // Make image URLs absolute
  const absoluteImageUrls = imageUrls.map(img => 
    img.startsWith('http') ? img : `${baseUrl}${img}`
  )

  return {
    title: `${title} | ${siteName}`,
    description,
    keywords: keywords.join(', '),
    authors: authors.map(author => ({ name: author })),
    category,
    
    // Basic metadata
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonical || undefined,
    },
    
    // OpenGraph metadata
    openGraph: {
      title,
      description,
      url: canonical || baseUrl,
      siteName,
      images: absoluteImageUrls.map(url => ({
        url,
        width: 1200,
        height: 630,
        alt: title,
      })),
      locale: 'en_US',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    
    // Twitter metadata
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: absoluteImageUrls,
      creator: '@socalshop',
      site: '@socalshop',
    },
    
    // Robots metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verification metadata
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_SITE_VERIFICATION,
      bing: process.env.BING_SITE_VERIFICATION,
    },
  }
}

export function generateProductMetadata(product: any): Metadata {
  return generateMetadata({
    title: product.name,
    description: product.description,
    images: product.images,
    type: 'product',
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
    keywords: [
      product.name,
      product.brand,
      product.category,
      ...product.tags || [],
    ],
    category: product.google_product_category,
    modifiedTime: product.updated_at,
  })
}

export function generateBlogMetadata(post: any): Metadata {
  return generateMetadata({
    title: post.title,
    description: post.excerpt || post.description,
    images: [post.featured_image],
    type: 'article',
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    authors: [post.author],
    keywords: [...post.tags || [], 'blog', 'article'],
    category: post.category,
  })
}

export function generateCategoryMetadata(category: any): Metadata {
  return generateMetadata({
    title: category.name,
    description: `Shop our collection of ${category.name}. Find the best ${category.name} products at great prices.`,
    type: 'website',
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category.slug}`,
    keywords: [category.name, 'shop', 'products', ...category.related_terms || []],
    category: category.name,
  })
}
