import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import configPromise from '@payload-config'
import { isSyntheticEmail } from '@/lib/identity'

/**
 * Admin-only: user picker backing the Zalo sender page. Supports
 * free-text search across name / email / phone and pagination so
 * the admin can scroll the whole customer list when looking for
 * a specific person.
 *
 * Query params:
 *   q      — optional substring match (name, email, phone).
 *   limit  — page size, default 50, cap 200.
 *   page   — 1-indexed.
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
  const limitRaw = Number.parseInt(url.searchParams.get('limit') ?? '50', 10)
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 50, 1), 200)
  const pageRaw = Number.parseInt(url.searchParams.get('page') ?? '1', 10)
  const page = Math.max(Number.isFinite(pageRaw) ? pageRaw : 1, 1)

  const where: Where = q
    ? {
        or: [{ name: { like: q } }, { email: { like: q } }, { phone: { like: q } }],
      }
    : {}

  const result = await payload.find({
    collection: 'users',
    where,
    limit,
    page,
    depth: 0,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  return NextResponse.json({
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    hasNextPage: result.hasNextPage,
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
