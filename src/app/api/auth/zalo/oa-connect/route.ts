import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { hasRole } from '@/access/roles'

/**
 * One-shot helper to kick off the Zalo OA OAuth flow so an admin
 * can generate a long-lived `refresh_token` without hand-crafting
 * curl. Redirects to Zalo's OA permission page; the user approves
 * there, Zalo redirects to `/api/auth/zalo/oa-callback` with a
 * short-lived `code`, and that callback exchanges the code + shows
 * the refresh token for one-time copy to Secret Manager.
 *
 * Admin-only (guarded below). Never embed in customer flows —
 * refresh tokens grant our backend the ability to send messages on
 * the OA's behalf, so leaking one is a marketing-spam vector.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || !hasRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Admin auth required' }, { status: 403 })
  }

  const appId = process.env.ZALO_APP_ID
  if (!appId) {
    return NextResponse.json({ error: 'ZALO_APP_ID not configured' }, { status: 500 })
  }

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'
  const redirectUri = `${serverUrl}/api/auth/zalo/oa-callback`

  const authorizeUrl =
    `https://oauth.zaloapp.com/v4/oa/permission?` +
    `app_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`

  return NextResponse.redirect(authorizeUrl)
}
