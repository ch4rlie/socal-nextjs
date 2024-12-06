import { NextResponse } from 'next/server'
import { syncProducts } from '@/utils/sync'

export const revalidate = 0

export async function POST(request: Request) {
  try {
    // Verify sync API key
    const authHeader = request.headers.get('authorization')
    const apiKey = authHeader?.split(' ')[1]

    if (!apiKey || apiKey !== process.env.SYNC_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Trigger sync
    const result = await syncProducts()

    if (!result.success) {
      return NextResponse.json(
        { error: 'Sync failed', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in sync endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
