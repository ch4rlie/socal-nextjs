import { createClient } from '@/utils/supabase/server'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export async function generateSitemap(baseUrl: string): Promise<SitemapUrl[]> {
  const supabase = await createClient()
  const urls: SitemapUrl[] = []

  // Add static pages
  urls.push(
    {
      loc: `${baseUrl}`,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/about`,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/contact`,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/products`,
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/blog`,
      changefreq: 'weekly',
      priority: 0.8
    }
  )

  // Add product pages
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  products?.forEach(product => {
    urls.push({
      loc: `${baseUrl}/products/${product.slug}`,
      lastmod: product.updated_at,
      changefreq: 'daily',
      priority: 0.9
    })
  })

  // Add category pages
  const { data: categories } = await supabase
    .from('products')
    .select('category_path')
    .not('category_path', 'is', null)

  const uniqueCategories = new Set<string>()
  categories?.forEach(product => {
    if (product.category_path) {
      product.category_path.forEach((category: string) => {
        uniqueCategories.add(category.toLowerCase().replace(/\s+/g, '-'))
      })
    }
  })

  uniqueCategories.forEach(category => {
    urls.push({
      loc: `${baseUrl}/category/${category}`,
      changefreq: 'daily',
      priority: 0.8
    })
  })

  // Add blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  posts?.forEach(post => {
    urls.push({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.updated_at,
      changefreq: 'weekly',
      priority: 0.7
    })
  })

  return urls
}

export function generateSitemapXml(urls: SitemapUrl[]): string {
  const xmlUrls = urls
    .map(url => {
      const tags = [
        `<url>`,
        `<loc>${url.loc}</loc>`,
        url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : '',
        url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : '',
        url.priority ? `<priority>${url.priority}</priority>` : '',
        `</url>`
      ]
      return tags.filter(Boolean).join('')
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`
}

export function generateRobotsTxt(baseUrl: string): string {
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`
}
