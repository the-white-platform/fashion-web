import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

/**
 * Start the Zalo OAuth v4 flow. Zalo mandates PKCE — we generate a
 * 64-char code_verifier, compute a SHA-256 challenge, stash the
 * verifier + anti-CSRF state in httpOnly cookies, and redirect the
 * browser to Zalo's `/v4/permission` consent screen.
 *
 * Scopes: none explicitly requested. Zalo's default OAuth scope
 * returns `id` + `name` + `picture`. Phone access is gated on a
 * separate enterprise-approved scope + private-key decryption, so
 * we fetch phone only after the user supplies it in profile.
 */
export async function GET(request: Request) {
  const appId = process.env.ZALO_APP_ID
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (() => {
      const proto = request.headers.get('x-forwarded-proto') || 'http'
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
      return host ? `${proto}://${host}` : 'http://localhost:3200'
    })()

  if (!appId) {
    return NextResponse.json({ error: 'Zalo App ID not configured' }, { status: 500 })
  }

  const state = randomBytes(32).toString('hex')

  // PKCE verifier — RFC 7636 allows 43-128 chars from the base64url
  // alphabet. 64 random bytes encoded as base64url sits at ~86
  // chars, safely inside that window.
  const codeVerifier = randomBytes(64).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')

  const redirectUri = `${serverUrl}/api/auth/zalo/callback`

  const zaloAuthUrl =
    `https://oauth.zaloapp.com/v4/permission?` +
    `app_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}`

  const response = NextResponse.redirect(zaloAuthUrl)

  // httpOnly cookies so they're only readable on the callback path.
  // secure only in prod — local dev runs over plain HTTP on
  // thewhite.local.
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 10, // 10 minutes — user has to finish consent fast
  }
  response.cookies.set('zalo_state', state, cookieOpts)
  response.cookies.set('zalo_verifier', codeVerifier, cookieOpts)

  return response
}
