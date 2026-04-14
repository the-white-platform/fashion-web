import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const facebookAppId = process.env.FACEBOOK_CLIENT_ID
  const facebookAppSecret = process.env.FACEBOOK_CLIENT_SECRET

  const cookieStore = await cookies()
  const storedState = cookieStore.get('facebook_state')?.value

  if (!code || state !== storedState) {
    return NextResponse.json({ error: 'Invalid OAuth state or missing code' }, { status: 400 })
  }

  if (!facebookAppId || !facebookAppSecret) {
    return NextResponse.json({ error: 'Facebook OAuth not configured' }, { status: 500 })
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: facebookAppId,
      client_secret: facebookAppSecret,
      code,
      redirect_uri: `${serverUrl}/api/auth/facebook/callback`,
    }),
  })
  const tokenData = await tokenResponse.json()

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error.message }, { status: 400 })
  }

  const accessToken = tokenData.access_token

  // Get user info — request `verified` alongside standard fields.
  // Facebook's `verified` field reflects account-level email confirmation status.
  // The `email` field is only returned when the user has a confirmed email on Facebook,
  // but `verified` gives us an explicit signal to reject unconfirmed accounts.
  const userResponse = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture,verified&access_token=${accessToken}`,
  )
  const fbUser = await userResponse.json()

  if (!fbUser.email) {
    return NextResponse.json({ error: 'No email returned from Facebook' }, { status: 400 })
  }

  // Bug #3 fix (Facebook): reject accounts whose email is not verified.
  // `verified` on the /me endpoint indicates Facebook has confirmed the account's email.
  if (fbUser.verified === false) {
    console.warn(`[auth/facebook] Login rejected: email not verified for ${fbUser.email}`)
    return NextResponse.redirect(`${serverUrl}/login?error=facebook_unverified`)
  }

  const payload = await getPayload({ config: configPromise })

  // Find or create user
  let user = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: fbUser.email,
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
    if (existingProvider && existingProvider !== 'facebook') {
      // Account is linked to another social provider (e.g. google)
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
        sub: fbUser.id,
        imageUrl: fbUser.picture?.data?.url,
      },
    })
  } else {
    const newUser = await payload.create({
      collection: 'users',
      draft: false,
      data: {
        email: fbUser.email,
        name: fbUser.name,
        sub: fbUser.id,
        provider: 'facebook',
        role: 'customer',
        imageUrl: fbUser.picture?.data?.url,
        password: randomBytes(32).toString('hex'),
      },
    })
    userId = newUser.id
  }

  const tokenValue = jwt.sign(
    {
      id: userId,
      collection: 'users',
      email: fbUser.email,
    },
    payload.secret,
    {
      expiresIn: '7d',
    },
  )

  const response = NextResponse.redirect(`${serverUrl}/`)

  response.cookies.delete('facebook_state')

  response.cookies.set('payload-token', tokenValue, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
