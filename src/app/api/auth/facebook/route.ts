import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const facebookAppId = process.env.FACEBOOK_CLIENT_ID
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  if (!facebookAppId) {
    return NextResponse.json({ error: 'Facebook App ID not configured' }, { status: 500 })
  }

  const state = Math.random().toString(36).substring(7)
  const redirectUri = encodeURIComponent(`${serverUrl}/api/auth/facebook/callback`)

  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${redirectUri}&state=${state}&scope=email,public_profile`

  const response = NextResponse.redirect(facebookAuthUrl)

  response.cookies.set('facebook_state', state, { httpOnly: true, secure: true })

  return response
}
