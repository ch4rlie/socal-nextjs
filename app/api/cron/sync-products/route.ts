import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify cron secret if provided
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Call the sync endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sync-products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SYNC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Cron job completed successfully',
      result
    })
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
