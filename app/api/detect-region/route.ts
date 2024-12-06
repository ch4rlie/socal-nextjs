import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
})

export async function GET(request: NextRequest) {
  try {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    // Return rate limit headers
    const headers = new Headers({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    })

    // If rate limit exceeded, return 429
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.floor((reset - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Get country code from Cloudflare headers
    const countryCode = request.headers.get('cf-ipcountry')

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country not detected' },
        { status: 400, headers }
      )
    }

    return NextResponse.json(
      { countryCode },
      { headers }
    )
  } catch (error) {
    console.error('Region detection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
