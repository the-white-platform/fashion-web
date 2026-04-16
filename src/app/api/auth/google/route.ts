import { NextResponse } from 'next/server'
import * as client from 'openid-client'

export async function GET(request: Request) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3200'

  if (!googleClientId) {
    return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 })
  }

  const config = await client.discovery(
    new URL('https://accounts.google.com'),
    googleClientId,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  const code_verifier = client.randomPKCECodeVerifier()
  const code_challenge = await client.calculatePKCECodeChallenge(code_verifier)
  const state = client.randomState()

  const parameters: Record<string, string> = {
    redirect_uri: `${serverUrl}/api/auth/google/callback`,
    scope: 'openid email profile',
    code_challenge,
    code_challenge_method: 'S256',
    state,
  }

  const redirectTo = client.buildAuthorizationUrl(config, parameters)

  const response = NextResponse.redirect(redirectTo.href)

  // Store PKCE and state in cookies. `secure: true` fails silently over HTTP
  // (dev runs on http://thewhite.local:3200), so gate it on NODE_ENV.
  // `sameSite: 'lax'` lets the cookie survive the Google-side redirect back.
  const isProd = process.env.NODE_ENV === 'production'
  const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/api/auth/google',
    maxAge: 600, // 10 minutes — enough for the OAuth round-trip
  }
  response.cookies.set('google_code_verifier', code_verifier, cookieOpts)
  response.cookies.set('google_state', state, cookieOpts)

  return response
}
