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

  const tokens = await client.authorizationCodeGrant(config, new URL(request.url), {
    pkceCodeVerifier: code_verifier,
    expectedState: storedState,
  })

  // Get user info from ID Token or UserInfo endpoint
  const userinfo = await client.fetchUserInfo(config, tokens.access_token, tokens.id_token || '')

  if (!userinfo.email) {
    return NextResponse.json({ error: 'No email returned from Google' }, { status: 400 })
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
    userId = user.docs[0].id
    // Update existing user if needed (e.g. sync avatar)
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        sub: userinfo.sub,
        provider: 'google',
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
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return response
}
