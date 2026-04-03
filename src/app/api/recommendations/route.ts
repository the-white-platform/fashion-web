import { type NextRequest, NextResponse } from 'next/server'
import { getRecommendations } from '@/utilities/recommendations'

export const dynamic = 'force-dynamic'

// 5-minute cache per unique query
const cache = new Map<string, { data: any; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const type = searchParams.get('type') ?? 'popular'
  const userId = searchParams.get('userId') ?? null
  const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : null
  const limit = Math.min(Number(searchParams.get('limit') ?? 8), 24)

  // Build cache key
  const cacheKey = `${type}:${userId ?? ''}:${productId ?? ''}:${limit}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' },
    })
  }

  try {
    const products = await getRecommendations({
      userId,
      productId,
      limit,
    })

    const result = { products }
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Recommendations API error:', err)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}
