import { randomBytes, randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'
import {
  looksLikeEmail,
  looksLikeVnPhone,
  normaliseVnPhone,
  syntheticEmailForPhone,
} from '@/lib/identity'

/**
 * Register a user given either an email OR a phone number as the
 * primary identifier. One identifier required; the other is
 * optional.
 *
 *   - email provided → use it as-is, phone optional.
 *   - phone only → synthesise email `<normalisedPhone>@phone.thewhite.cool`
 *     so Payload auth (which requires unique non-null email) stays
 *     happy. Order / password-reset flows check the domain to skip
 *     sending to these non-deliverable addresses.
 *
 * On success issues a `payload-token` cookie so the client can skip
 * a follow-up login call — kept in sync with the JWT shape used by
 * the Google/Facebook callbacks so `/api/users/me` works identically.
 */
export async function POST(request: Request) {
  let body: { name?: string; identifier?: string; password?: string; phone?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  const rawIdentifier = (body.identifier || '').trim()
  const rawPhone = (body.phone || '').trim()
  const password = body.password || ''

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!rawIdentifier) {
    return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  // Classify the identifier. `@` → email, all-digits of the right
  // length → phone. Ambiguous / malformed input rejects early.
  let email: string | null = null
  let phone: string | null = null

  if (looksLikeEmail(rawIdentifier)) {
    email = rawIdentifier.toLowerCase()
    // Optional phone field alongside an email identifier.
    if (rawPhone) {
      phone = normaliseVnPhone(rawPhone)
      if (!phone) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
      }
    }
  } else if (looksLikeVnPhone(rawIdentifier)) {
    phone = normaliseVnPhone(rawIdentifier)
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    email = syntheticEmailForPhone(phone)
  } else {
    return NextResponse.json(
      { error: 'Identifier must be a valid email or Vietnamese phone number' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config: configPromise })

  // Duplicate check — keyed on whichever identifier is semantically
  // meaningful. Email takes precedence (uniqueness is enforced at
  // DB level anyway), but we also reject phone collisions with a
  // friendly message rather than letting a second user register and
  // silently own the same number.
  const duplicateEmail = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (duplicateEmail.docs.length > 0) {
    return NextResponse.json({ error: 'This account is already registered' }, { status: 409 })
  }

  if (phone) {
    const duplicatePhone = await payload.find({
      collection: 'users',
      where: { phone: { equals: phone } },
      limit: 1,
    })
    if (duplicatePhone.docs.length > 0) {
      return NextResponse.json(
        { error: 'This phone number is already registered' },
        { status: 409 },
      )
    }
  }

  let newUser
  try {
    newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name,
        phone: phone || undefined,
        provider: 'local',
        role: 'customer',
      },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'register-identity: create failed' })
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }

  // Session + JWT — mirrors the Facebook callback so /api/users/me
  // works the same regardless of how the user registered.
  const sid = randomUUID()
  const usersAuthConfig = payload.collections['users']?.config.auth
  const tokenExpirationSec =
    typeof usersAuthConfig === 'object' && usersAuthConfig.tokenExpiration
      ? usersAuthConfig.tokenExpiration
      : 7200
  const now = new Date()
  const sessionExpiresAt = new Date(now.getTime() + tokenExpirationSec * 1000)

  const userDoc = await payload.findByID({
    collection: 'users',
    id: newUser.id,
    depth: 0,
  })
  const liveSessions = (userDoc.sessions || []).filter((s) => new Date(s.expiresAt) > now)
  await payload.update({
    collection: 'users',
    id: newUser.id,
    data: {
      sessions: [
        ...liveSessions,
        { id: sid, createdAt: now.toISOString(), expiresAt: sessionExpiresAt.toISOString() },
      ],
    },
  })

  const tokenValue = jwt.sign(
    {
      id: newUser.id,
      collection: 'users',
      email,
      sid,
    },
    payload.secret,
    { expiresIn: tokenExpirationSec },
  )

  const response = NextResponse.json({
    user: { id: newUser.id, email, phone, name },
  })
  response.cookies.set('payload-token', tokenValue, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenExpirationSec,
  })
  return response

  // Silence TypeScript about unused imports when the branch pruned
  // them — randomBytes is retained for parity with the other
  // auth routes in case a future change needs it.
  void randomBytes
}
