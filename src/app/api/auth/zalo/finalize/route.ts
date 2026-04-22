import { randomBytes, randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import { syntheticEmailForZalo } from '@/lib/identity'

/**
 * Browser-assisted finisher for the Zalo OAuth flow. The server
 * callback (`/api/auth/zalo/callback`) exchanges the `code` for an
 * `access_token`, then — when `/me` is geo-blocked — redirects the
 * user to a client page that calls `/me` from their (Vietnamese)
 * browser. That page POSTs the resulting profile here.
 *
 * Trust model: the `accessToken` in the POST body must match the
 * httpOnly `zalo_access_token` cookie that the callback just set.
 * Binds this request to the OAuth session that juuust completed,
 * so an attacker can't forge a POST with a fake Zalo id without
 * first going through our OAuth flow.
 */
interface FinalizeBody {
  accessToken?: string
  id?: string
  name?: string
  picture?: string
}

export async function POST(request: Request) {
  let body: FinalizeBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const submittedToken = body.accessToken?.trim()
  const zaloId = body.id?.trim()
  const zaloName = (body.name && body.name.trim()) || 'Zalo User'
  const zaloPicture = body.picture?.trim()

  if (!submittedToken || !zaloId) {
    return NextResponse.json({ error: 'Missing accessToken or id' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const storedToken = cookieStore.get('zalo_access_token')?.value
  if (!storedToken || storedToken !== submittedToken) {
    return NextResponse.json({ error: 'Session token mismatch' }, { status: 401 })
  }

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3200'
  const payload = await getPayload({ config: configPromise })

  // --- Find-or-create user keyed on zaloUserId (same logic as the
  // OAuth callback's happy path). ---
  const existingByZaloId = await payload.find({
    collection: 'users',
    where: { zaloUserId: { equals: zaloId } },
    limit: 1,
  })

  let userId: string | number

  if (existingByZaloId.docs.length > 0) {
    const existing = existingByZaloId.docs[0]
    const existingProvider = existing.provider as string | undefined

    if (existingProvider && existingProvider !== 'zalo') {
      return NextResponse.json(
        {
          error: `account_linked_to_${existingProvider}`,
          redirect: `${serverUrl}/login?error=account_linked_to_${existingProvider}`,
        },
        { status: 409 },
      )
    }

    userId = existing.id
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        name: zaloName,
        imageUrl: zaloPicture,
        zaloUserId: zaloId,
      },
    })
  } else {
    const syntheticEmail = syntheticEmailForZalo(zaloId)
    try {
      const created = await payload.create({
        collection: 'users',
        data: {
          email: syntheticEmail,
          name: zaloName,
          password: randomBytes(32).toString('hex'),
          role: 'customer',
          provider: 'zalo',
          zaloUserId: zaloId,
          imageUrl: zaloPicture,
        },
      })
      userId = created.id
    } catch (err) {
      console.error('[auth/zalo/finalize] user create failed', err)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }
  }

  // --- Session + JWT — mirrors the callback tail so /api/users/me
  // works the same regardless of which path finished the login. ---
  const sid = randomUUID()
  const usersAuthConfig = payload.collections['users']?.config.auth
  const tokenExpirationSec =
    typeof usersAuthConfig === 'object' && usersAuthConfig.tokenExpiration
      ? usersAuthConfig.tokenExpiration
      : 7200
  const now = new Date()
  const sessionExpiresAt = new Date(now.getTime() + tokenExpirationSec * 1000)

  const userDoc = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
  const liveSessions = (
    (userDoc as { sessions?: Array<{ id: string; createdAt?: string; expiresAt: string }> })
      .sessions || []
  ).filter((s) => new Date(s.expiresAt) > now)
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
    { id: userId, collection: 'users', email: (userDoc as { email?: string }).email, sid },
    payload.secret,
    { expiresIn: tokenExpirationSec },
  )

  const response = NextResponse.json({ ok: true, user: { id: userId } })
  response.cookies.delete('zalo_access_token')
  response.cookies.set('payload-token', tokenValue, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenExpirationSec,
  })
  return response
}
