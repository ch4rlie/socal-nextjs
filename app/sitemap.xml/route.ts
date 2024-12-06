import { generateSitemap, generateSitemapXml } from '@/utils/sitemap'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const urls = await generateSitemap(baseUrl)
    const xml = generateSitemapXml(urls)

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
