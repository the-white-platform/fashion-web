import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  looksLikeEmail,
  looksLikeVnPhone,
  normaliseVnPhone,
  syntheticEmailForPhone,
} from '@/lib/identity'

/**
 * Accept either an email or a phone number as identifier and
 * complete a Payload login. Phone inputs are normalised and
 * resolved to the stored user's email (the synthetic
 * `<phone>@phone.thewhite.cool` for phone-only accounts, or the
 * real email for accounts that have both).
 *
 * Returning the same shape as `/api/users/login` lets UserContext
 * treat this route as a drop-in alternative.
 */
export async function POST(request: Request) {
  let body: { identifier?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const identifier = (body.identifier || '').trim()
  const password = body.password || ''

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  let loginEmail: string | null = null

  if (looksLikeEmail(identifier)) {
    loginEmail = identifier.toLowerCase()
  } else if (looksLikeVnPhone(identifier)) {
    const normalised = normaliseVnPhone(identifier)
    if (!normalised) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    // Prefer lookup by phone field (covers accounts that have BOTH
    // a real email AND a phone). Falls back to synthetic email
    // lookup for phone-only accounts where the phone field might
    // not have been populated (legacy rows, edge cases).
    const byPhone = await payload.find({
      collection: 'users',
      where: { phone: { equals: normalised } },
      limit: 1,
    })
    if (byPhone.docs.length > 0) {
      loginEmail = byPhone.docs[0].email
    } else {
      loginEmail = syntheticEmailForPhone(normalised)
    }
  } else {
    return NextResponse.json(
      { error: 'Identifier must be a valid email or Vietnamese phone number' },
      { status: 400 },
    )
  }

  // Delegate to Payload's REST login so session + cookie issuance
  // matches the email-login path exactly. Fetch same origin —
  // Next.js routes can call each other in-process on Vercel /
  // Cloud Run without leaving the container, but we still need to
  // forward the original host so the Set-Cookie lands with the
  // right Domain.
  const originHeader = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protoHeader = request.headers.get('x-forwarded-proto') || 'http'
  const baseUrl = originHeader
    ? `${protoHeader}://${originHeader}`
    : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3200'

  const payloadLoginRes = await fetch(`${baseUrl}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: loginEmail, password }),
  })

  if (!payloadLoginRes.ok) {
    // 401 / 403: bad credentials. Don't leak whether the account
    // exists — same "invalid credentials" for both
    // wrong-password-on-existing-account and
    // no-such-account to prevent user enumeration.
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const loginData = await payloadLoginRes.json()
  const setCookie = payloadLoginRes.headers.get('set-cookie')
  const response = NextResponse.json(loginData)
  if (setCookie) {
    // Forward Payload's Set-Cookie to the client. Pass through as-is
    // — Payload already sets HttpOnly / Secure / SameSite correctly.
    response.headers.set('set-cookie', setCookie)
  }
  return response
}
