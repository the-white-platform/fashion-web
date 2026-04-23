import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Admin-only: walk every user and drop expired sessions. Safety
 * valve for the bloat scenario that took admin login offline on
 * 2026-04-22 and 2026-04-23 — run this if login latency starts
 * creeping back up. Idempotent; safe to invoke repeatedly.
 *
 * The collection hooks prune on every login/write already, so
 * this endpoint is a cold-cleanup tool, not a primary mechanism.
 */
export async function POST() {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user || user.collection !== 'users' || (user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const nowMs = Date.now()
  let pageCursor: number | string | undefined = undefined
  let scanned = 0
  let touched = 0
  let dropped = 0

  // Paginate to avoid pulling the entire users collection into
  // memory. 50 per page keeps each tick light on the Cloud SQL
  // proxy — adjust if we ever grow past ~10k users.
  for (let page = 1; page <= 1000; page++) {
    const res = await payload.find({
      collection: 'users',
      limit: 50,
      page,
      depth: 0,
      overrideAccess: true,
    })
    if (res.docs.length === 0) break
    for (const u of res.docs) {
      scanned += 1
      const sessions = (u as { sessions?: Array<{ expiresAt?: string }> }).sessions ?? []
      if (sessions.length === 0) continue
      const live = sessions.filter((s) => {
        const exp = s?.expiresAt ? Date.parse(String(s.expiresAt)) : NaN
        return Number.isFinite(exp) && exp > nowMs
      })
      if (live.length === sessions.length) continue
      dropped += sessions.length - live.length
      touched += 1
      await payload.update({
        collection: 'users',
        id: (u as { id: number | string }).id,
        data: { sessions: live },
        overrideAccess: true,
      })
    }
    if (!res.hasNextPage) break
    pageCursor = page
  }

  return NextResponse.json({ ok: true, scanned, touched, dropped, lastPage: pageCursor })
}
