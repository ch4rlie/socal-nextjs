import { ShippingRegion } from '@/types/shipping'

const COUNTRY_TO_REGION_MAP: Record<string, ShippingRegion> = {
  // North America
  'US': 'USA',
  'CA': 'Canada',
  
  // Europe
  'GB': 'United Kingdom',
  'DE': 'Europe',
  'FR': 'Europe',
  'IT': 'Europe',
  'ES': 'Europe',
  'NL': 'Europe',
  'BE': 'Europe',
  'PT': 'Europe',
  'IE': 'Europe',
  'DK': 'Europe',
  'SE': 'Europe',
  'FI': 'Europe',
  'AT': 'Europe',
  'GR': 'Europe',
  'PL': 'Europe',
  'CZ': 'Europe',
  'RO': 'Europe',
  'HU': 'Europe',
  'BG': 'Europe',
  'SK': 'Europe',
  'HR': 'Europe',
  
  // EFTA States
  'CH': 'EFTA States',
  'NO': 'EFTA States',
  'IS': 'EFTA States',
  'LI': 'EFTA States',
  
  // Asia Pacific
  'JP': 'Japan',
  'AU': 'Australia/New Zealand',
  'NZ': 'Australia/New Zealand',
  
  // South America
  'BR': 'Brazil',
  
  // Additional mappings for better coverage
  'MX': 'Worldwide',
  'SG': 'Worldwide',
  'KR': 'Worldwide',
  'IN': 'Worldwide',
  'AE': 'Worldwide',
  'SA': 'Worldwide',
  'ZA': 'Worldwide'
}

// Cache detection results
const DETECTION_CACHE_KEY = 'user-region-cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface CachedRegion {
  region: ShippingRegion
  timestamp: number
  source: 'ip' | 'cloudflare' | 'manual'
  confidence: number
}

function getCachedRegion(): CachedRegion | null {
  try {
    const cached = localStorage.getItem(DETECTION_CACHE_KEY)
    if (!cached) return null

    const data = JSON.parse(cached) as CachedRegion
    const age = Date.now() - data.timestamp

    // Return null if cache is expired
    if (age > CACHE_DURATION) {
      localStorage.removeItem(DETECTION_CACHE_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

function cacheRegion(region: ShippingRegion, source: CachedRegion['source'], confidence: number) {
  try {
    const data: CachedRegion = {
      region,
      timestamp: Date.now(),
      source,
      confidence
    }
    localStorage.setItem(DETECTION_CACHE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to cache region:', error)
  }
}

async function detectRegionByIP(): Promise<ShippingRegion | null> {
  const services = [
    // ipapi.co
    async () => {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      return data.country_code
    },
    // ip-api.com
    async () => {
      const response = await fetch('http://ip-api.com/json/')
      const data = await response.json()
      return data.countryCode
    },
    // ipwhois.app
    async () => {
      const response = await fetch('https://ipwhois.app/json/')
      const data = await response.json()
      return data.country_code
    }
  ]

  for (const service of services) {
    try {
      const countryCode = await service()
      if (countryCode && countryCode in COUNTRY_TO_REGION_MAP) {
        const region = COUNTRY_TO_REGION_MAP[countryCode]
        cacheRegion(region, 'ip', 0.7)
        return region
      }
    } catch {
      continue
    }
  }

  return null
}

async function detectRegionByCloudflare(): Promise<ShippingRegion | null> {
  try {
    const response = await fetch('/api/detect-region')
    const data = await response.json()
    
    if (data.countryCode && data.countryCode in COUNTRY_TO_REGION_MAP) {
      const region = COUNTRY_TO_REGION_MAP[data.countryCode]
      cacheRegion(region, 'cloudflare', 0.8)
      return region
    }
    
    return null
  } catch (error) {
    console.warn('Cloudflare detection failed:', error)
    return null
  }
}

export async function detectUserRegion(): Promise<ShippingRegion> {
  // Check cache first
  const cached = getCachedRegion()
  if (cached && cached.confidence > 0.5) {
    return cached.region
  }

  // Try all detection methods in parallel
  const results = await Promise.allSettled([
    detectRegionByIP(),
    detectRegionByCloudflare()
  ])

  // Filter successful results
  const successfulResults = results
    .filter((result): result is PromiseFulfilledResult<ShippingRegion | null> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value as ShippingRegion)

  if (successfulResults.length > 0) {
    // Return the most common result
    const regionCounts = new Map<ShippingRegion, number>()
    successfulResults.forEach(region => {
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1)
    })

    let maxCount = 0
    let mostLikelyRegion: ShippingRegion = 'USA'
    
    regionCounts.forEach((count, region) => {
      if (count > maxCount) {
        maxCount = count
        mostLikelyRegion = region
      }
    })

    return mostLikelyRegion
  }

  return 'USA' // Default fallback
}
