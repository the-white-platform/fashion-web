import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * PATCH /api/reviews/helpful
 * Body: { reviewId: number }
 *
 * Increments helpfulCount on the review.
 * Dedup is done via a signed cookie so unauthenticated users are also
 * limited to one vote per review per browser.
 */
export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const reviewId = body?.reviewId ? Number(body.reviewId) : null

  if (!reviewId || isNaN(reviewId)) {
    return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const votedKey = `helpful_voted_${reviewId}`
  const alreadyVoted = cookieStore.get(votedKey)

  if (alreadyVoted) {
    return NextResponse.json({ error: 'Already voted' }, { status: 409 })
  }

  const payload = await getPayload({ config: configPromise })

  const review = await payload.findByID({
    collection: 'reviews',
    id: reviewId,
    depth: 0,
  })

  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  // Check if the requesting user is logged in and already in helpfulVoters
  const token = request.cookies.get('payload-token')?.value
  let userId: number | null = null
  if (token) {
    try {
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
        headers: { Cookie: `payload-token=${token}` },
      })
      if (meRes.ok) {
        const me = await meRes.json()
        userId = me?.user?.id ?? null
      }
    } catch {
      // ignore — cookie-based dedup still works
    }
  }

  const currentVoters: number[] = (
    (review.helpfulVoters ?? []) as Array<number | { id: number }>
  ).map((v) => (typeof v === 'object' ? v.id : v))

  if (userId && currentVoters.includes(userId)) {
    return NextResponse.json({ error: 'Already voted' }, { status: 409 })
  }

  const updatedVoters = userId ? [...currentVoters, userId] : currentVoters

  const updated = await payload.update({
    collection: 'reviews',
    id: reviewId,
    data: {
      helpfulCount: (review.helpfulCount ?? 0) + 1,
      helpfulVoters: updatedVoters,
    },
  })

  const response = NextResponse.json({ helpfulCount: updated.helpfulCount })

  // Set a 30-day cookie to prevent browser-level double-voting
  response.cookies.set(votedKey, '1', {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
