import { randomBytes, randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import { syntheticEmailForZalo } from '@/lib/identity'

/**
 * Zalo OAuth v4 callback. Exchanges the `code` for an access token
 * using PKCE (the verifier stashed by the initiator route), pulls
 * the Zalo user profile, and upserts a Payload user keyed on the
 * Zalo user id.
 *
 * Zalo doesn't typically return email at the default scope, so we
 * synthesise `zalo-<zaloId>@zalo.thewhite.cool` to satisfy Payload
 * auth's email-required invariant. The user can set a real email
 * later from the profile page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (() => {
      const proto = request.headers.get('x-forwarded-proto') || 'http'
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
      return host ? `${proto}://${host}` : 'http://localhost:3200'
    })()
  const appId = process.env.ZALO_APP_ID
  const appSecret = process.env.ZALO_APP_SECRET

  if (errorParam) {
    return NextResponse.redirect(`${serverUrl}/login?error=zalo_cancelled`)
  }

  if (!appId || !appSecret) {
    return NextResponse.json({ error: 'Zalo OAuth not configured' }, { status: 500 })
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('zalo_state')?.value
  const storedVerifier = cookieStore.get('zalo_verifier')?.value

  if (!code || !state || state !== storedState || !storedVerifier) {
    return NextResponse.redirect(`${serverUrl}/login?error=zalo_state_mismatch`)
  }

  // --- Exchange code for access_token ---
  const tokenRes = await fetch('https://oauth.zaloapp.com/v4/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      secret_key: appSecret,
    },
    body: new URLSearchParams({
      app_id: appId,
      code,
      grant_type: 'authorization_code',
      code_verifier: storedVerifier,
    }),
  })

  const tokenData = await tokenRes.json().catch(() => ({}))

  if (!tokenRes.ok || !tokenData.access_token) {
    console.warn('[auth/zalo] token exchange failed', tokenData)
    return NextResponse.redirect(`${serverUrl}/login?error=zalo_token_exchange_failed`)
  }

  const accessToken = tokenData.access_token as string

  // --- Fetch user profile ---
  // Start with the richest field set. Zalo's `-501` IP gate applies
  // to "personal information" (name, picture); the `id` field alone
  // is not personal info and is returned even from non-VN IPs, so
  // fall back to id-only on geo rejection. That gets us a stable
  // Zalo user id for find-or-create; the user can set name + avatar
  // later from the profile page.
  async function fetchProfile(fields: string) {
    const r = await fetch(`https://graph.zalo.me/v2.0/me?fields=${fields}`, {
      headers: { access_token: accessToken },
    })
    return { ok: r.ok, body: (await r.json().catch(() => ({}))) as any }
  }

  let { ok: profileOk, body: profile } = await fetchProfile('id,name,picture')

  if ((!profileOk || !profile?.id) && profile?.error === -501) {
    // Geo-restricted on personal info — retry with id only.
    const retry = await fetchProfile('id')
    profileOk = retry.ok
    profile = retry.body
  }

  if (!profileOk || !profile?.id) {
    console.warn('[auth/zalo] /me fetch failed', profile)
    // Zalo returns a specific error code + human-readable message
    // when personal info is blocked (e.g. error -501 for
    // IP-not-inside-Vietnam). Pass both back to the login page so
    // the user sees the actual reason instead of a generic retry
    // prompt.
    const zaloCode =
      typeof profile?.error === 'number' || typeof profile?.error === 'string'
        ? String(profile.error)
        : ''
    const zaloMessage = typeof profile?.message === 'string' ? profile.message : ''
    const params = new URLSearchParams({ error: 'zalo_profile_failed' })
    if (zaloCode) params.set('zalo_code', zaloCode)
    if (zaloMessage) params.set('zalo_message', zaloMessage)
    return NextResponse.redirect(`${serverUrl}/login?${params.toString()}`)
  }

  const zaloUserId = String(profile.id)
  const zaloName = (profile.name as string | undefined) ?? 'Zalo User'
  const zaloPicture = profile.picture?.data?.url as string | undefined

  const payload = await getPayload({ config: configPromise })

  // --- Find-or-create user keyed on zaloUserId ---
  const existingByZaloId = await payload.find({
    collection: 'users',
    where: { zaloUserId: { equals: zaloUserId } },
    limit: 1,
  })

  let userId: string | number

  if (existingByZaloId.docs.length > 0) {
    const existing = existingByZaloId.docs[0]
    const existingProvider = existing.provider as string | undefined

    if (existingProvider && existingProvider !== 'zalo') {
      return NextResponse.redirect(`${serverUrl}/login?error=account_linked_to_${existingProvider}`)
    }

    userId = existing.id
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        name: zaloName,
        imageUrl: zaloPicture,
        // Keep zaloUserId in case it was ever blanked; idempotent.
        zaloUserId,
      },
    })
  } else {
    const syntheticEmail = syntheticEmailForZalo(zaloUserId)
    try {
      const created = await payload.create({
        collection: 'users',
        data: {
          email: syntheticEmail,
          name: zaloName,
          password: randomBytes(32).toString('hex'),
          role: 'customer',
          provider: 'zalo',
          zaloUserId,
          imageUrl: zaloPicture,
        },
      })
      userId = created.id
    } catch (err) {
      console.error('[auth/zalo] user create failed', err)
      return NextResponse.redirect(`${serverUrl}/login?error=zalo_account_create_failed`)
    }
  }

  // --- Session + JWT — same shape as Facebook callback ---
  const sid = randomUUID()
  const usersAuthConfig = payload.collections['users']?.config.auth
  const tokenExpirationSec =
    typeof usersAuthConfig === 'object' && usersAuthConfig.tokenExpiration
      ? usersAuthConfig.tokenExpiration
      : 7200
  const now = new Date()
  const sessionExpiresAt = new Date(now.getTime() + tokenExpirationSec * 1000)

  const userDoc = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
  const liveSessions = (userDoc.sessions || []).filter((s) => new Date(s.expiresAt) > now)
  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      sessions: [
        ...liveSessions,
        { id: sid, createdAt: now.toISOString(), expiresAt: sessionExpiresAt.toISOString() },
      ],
    },
  })

  const tokenValue = jwt.sign(
    { id: userId, collection: 'users', email: userDoc.email, sid },
    payload.secret,
    { expiresIn: tokenExpirationSec },
  )

  const response = NextResponse.redirect(`${serverUrl}/`)
  response.cookies.delete('zalo_state')
  response.cookies.delete('zalo_verifier')
  response.cookies.set('payload-token', tokenValue, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenExpirationSec,
  })
  return response
}
