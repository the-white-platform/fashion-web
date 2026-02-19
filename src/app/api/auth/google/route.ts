import { NextResponse } from 'next/server'
import * as client from 'openid-client'

export async function GET(request: Request) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

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

  // Store PKCE and state in cookies
  response.cookies.set('google_code_verifier', code_verifier, { httpOnly: true, secure: true })
  response.cookies.set('google_state', state, { httpOnly: true, secure: true })

  return response
}
