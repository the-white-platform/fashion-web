import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import { looksLikeEmail, looksLikeVnPhone, normaliseVnPhone } from '@/lib/identity'
import { verifyOtp } from '@/lib/otp'

interface VerifyBody {
  identifier?: string
  code?: string
}

/**
 * Verify the OTP and, on success, issue a `payload-token` cookie
 * (same shape as Google/Facebook callbacks) so the client lands
 * already-authenticated. Always clears the stored OTP — one-shot.
 *
 * Constant-time compare in `verifyOtp` prevents timing oracles.
 * Unknown identifier + wrong code collapse to the same 401 message
 * for consistency.
 */
export async function POST(request: Request) {
  let body: VerifyBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawIdentifier = (body.identifier || '').trim()
  const code = (body.code || '').trim()

  if (!rawIdentifier || !code) {
    return NextResponse.json({ error: 'Identifier and code are required' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  let userId: number | string | null = null
  let userEmail: string | null = null

  if (looksLikeEmail(rawIdentifier)) {
    const res = await payload.find({
      collection: 'users',
      where: { email: { equals: rawIdentifier.toLowerCase() } },
      limit: 1,
    })
    const user = res.docs[0]
    if (user) {
      userId = user.id
      userEmail = user.email
    }
  } else if (looksLikeVnPhone(rawIdentifier)) {
    const phone = normaliseVnPhone(rawIdentifier)
    if (phone) {
      const res = await payload.find({
        collection: 'users',
        where: { phone: { equals: phone } },
        limit: 1,
      })
      const user = res.docs[0]
      if (user) {
        userId = user.id
        userEmail = user.email
      }
    }
  } else {
    return NextResponse.json(
      { error: 'Identifier must be a valid email or Vietnamese phone number' },
      { status: 400 },
    )
  }

  if (!userId || !userEmail) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  const userDoc = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
  const { otpHash, otpExpiresAt } = userDoc as {
    otpHash?: string | null
    otpExpiresAt?: string | null
  }

  if (!otpHash || !otpExpiresAt) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }
  if (new Date(otpExpiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Code expired' }, { status: 401 })
  }
  if (!verifyOtp(code, otpHash, userId)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  // Success — clear the OTP fields so the code is one-shot. Also
  // flip emailVerified since the user just proved they own the
  // mailbox.
  const sid = randomUUID()
  const usersAuthConfig = payload.collections['users']?.config.auth
  const tokenExpirationSec =
    typeof usersAuthConfig === 'object' && usersAuthConfig.tokenExpiration
      ? usersAuthConfig.tokenExpiration
      : 7200
  const now = new Date()
  const sessionExpiresAt = new Date(now.getTime() + tokenExpirationSec * 1000)
  const liveSessions = (
    (userDoc as { sessions?: Array<{ id: string; createdAt?: string; expiresAt: string }> })
      .sessions || []
  ).filter((s) => new Date(s.expiresAt) > now)

  try {
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        otpHash: null,
        otpExpiresAt: null,
        emailVerified: true,
        sessions: [
          ...liveSessions,
          { id: sid, createdAt: now.toISOString(), expiresAt: sessionExpiresAt.toISOString() },
        ],
      },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'otp/verify: failed to finalise login' })
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }

  const tokenValue = jwt.sign(
    {
      id: userId,
      collection: 'users',
      email: userEmail,
      sid,
    },
    payload.secret,
    { expiresIn: tokenExpirationSec },
  )

  const response = NextResponse.json({
    user: { id: userId, email: userEmail },
  })
  response.cookies.set('payload-token', tokenValue, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenExpirationSec,
  })
  return response
}
