import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextResponse } from 'next/server'
import * as client from 'openid-client'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!googleClientId || !googleClientSecret) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  }

  const cookieStore = await cookies()
  const code_verifier = cookieStore.get('google_code_verifier')?.value
  const storedState = cookieStore.get('google_state')?.value

  if (!code_verifier || !storedState) {
    return NextResponse.json({ error: 'Missing OAuth session data' }, { status: 400 })
  }

  const config = await client.discovery(
    new URL('https://accounts.google.com'),
    googleClientId,
    googleClientSecret,
  )

  // Cloud Run terminates TLS at the ingress; `request.url` can come through as
  // http://… internally, which would make openid-client send a redirect_uri at
  // token exchange that doesn't match the https:// URI used in the auth step
  // (and isn't a registered redirect URI). Pin to the canonical server URL.
  const currentUrl = new URL(`${serverUrl}/api/auth/google/callback`)
  currentUrl.search = new URL(request.url).search

  const tokens = await client.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: code_verifier,
    expectedState: storedState,
  })

  // `fetchUserInfo`'s 3rd arg is the expected subject string, not the ID token.
  // Pull `sub` from the parsed ID token claims so the sub-comparison passes.
  const idTokenSub = tokens.claims()?.sub
  if (!idTokenSub) {
    return NextResponse.json({ error: 'ID token missing sub claim' }, { status: 400 })
  }
  const userinfo = await client.fetchUserInfo(config, tokens.access_token, idTokenSub)

  if (!userinfo.email) {
    return NextResponse.json({ error: 'No email returned from Google' }, { status: 400 })
  }

  // Bug #3 fix: reject unverified Google email addresses before any user lookup
  if (userinfo.email_verified !== true) {
    console.warn(`[auth/google] Login rejected: email not verified for ${userinfo.email}`)
    return NextResponse.redirect(`${serverUrl}/login?error=google_unverified`)
  }

  const payload = await getPayload({ config: configPromise })

  // Find or create user
  let user = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: userinfo.email,
      },
    },
    limit: 1,
  })

  let userId: string | number

  if (user.docs.length > 0) {
    const existingUser = user.docs[0]
    userId = existingUser.id
    const existingProvider = existingUser.provider as string | undefined

    // Bug #8 fix: guard against silently overwriting a different provider's account
    if (existingProvider && existingProvider !== 'google') {
      // Account is linked to another social provider (e.g. facebook)
      return NextResponse.redirect(`${serverUrl}/login?error=account_linked_to_${existingProvider}`)
    }

    if (!existingProvider) {
      // Account was created with email/password — user must link social from profile
      return NextResponse.redirect(`${serverUrl}/login?error=account_uses_password`)
    }

    // Same provider: safe to update sub (may have changed) and avatar
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        sub: userinfo.sub,
        imageUrl: userinfo.picture as string,
      },
    })
  } else {
    // Create new user
    const newUser = await payload.create({
      collection: 'users',
      draft: false,
      data: {
        email: userinfo.email as string,
        name: (userinfo.name || userinfo.given_name) as string,
        sub: userinfo.sub,
        provider: 'google',
        role: 'customer',
        imageUrl: userinfo.picture as string,
        password: randomBytes(32).toString('hex'),
      },
    })
    userId = newUser.id
  }

  const response = NextResponse.redirect(`${serverUrl}/`)

  // Clean up cookies
  response.cookies.delete('google_code_verifier')
  response.cookies.delete('google_state')

  const tokenValue = jwt.sign(
    {
      id: userId,
      collection: 'users',
      email: userinfo.email,
    },
    payload.secret,
    {
      expiresIn: '7d',
    },
  )

  response.cookies.set('payload-token', tokenValue, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return response
}
