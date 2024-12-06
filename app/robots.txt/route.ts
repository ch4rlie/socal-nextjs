import { generateRobotsTxt } from '@/utils/sitemap'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const robotsTxt = generateRobotsTxt(baseUrl)

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    return new NextResponse('Error generating robots.txt', { status: 500 })
  }
}
