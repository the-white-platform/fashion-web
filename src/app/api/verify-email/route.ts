import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const users = await payload.find({
      collection: 'users',
      where: { emailVerifyToken: { equals: token } },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const user = users.docs[0]
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        emailVerified: true,
        emailVerifyToken: '',
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
