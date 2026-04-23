import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import configPromise from '@payload-config'
import { isSyntheticEmail } from '@/lib/identity'

/**
 * Admin-only: thin user-search endpoint backing the Zalo sender
 * page. Matches against name, email, or phone (substring). Caps
 * output to 25 rows — this is a picker, not a full export.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user || user.collection !== 'users' || (user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const url = new URL(request.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  const where: Where = q
    ? {
        or: [{ name: { like: q } }, { email: { like: q } }, { phone: { like: q } }],
      }
    : {}

  const result = await payload.find({
    collection: 'users',
    where,
    limit: 25,
    depth: 0,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  return NextResponse.json({
    users: result.docs.map((u) => {
      const email = (u as { email?: string }).email ?? null
      return {
        id: u.id,
        name: (u as { name?: string }).name ?? null,
        email: email && !isSyntheticEmail(email) ? email : null,
        phone: (u as { phone?: string }).phone ?? null,
        role: (u as { role?: string }).role ?? 'customer',
        provider: (u as { provider?: string }).provider ?? 'local',
        dateOfBirth: (u as { dateOfBirth?: string }).dateOfBirth ?? null,
        zaloDeliveryStatus: (u as { zaloDeliveryStatus?: string }).zaloDeliveryStatus ?? 'unknown',
      }
    }),
  })
}
