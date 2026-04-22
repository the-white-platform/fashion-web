import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Create a pending referral record on behalf of a newly registered
 * user. The `referrals` collection has admin-only write access
 * (the payout hook needs to trust that rows reach it clean), so the
 * register flow hits this route instead of POST /api/referrals
 * directly. Guards here:
 *   - caller must be authenticated (prevents spoofing a referee)
 *   - caller is always treated as the referee (ignore body.referee)
 *   - referrer is looked up by referralCode (not trusted from body)
 *   - self-referral blocked
 *   - duplicate pending referral blocked
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: { referralCode?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const referralCode = (body.referralCode || '').trim()
  if (!referralCode) {
    return NextResponse.json({ error: 'referralCode is required' }, { status: 400 })
  }

  const referrerRes = await payload.find({
    collection: 'users',
    where: { referralCode: { equals: referralCode } },
    limit: 1,
  })
  const referrer = referrerRes.docs[0]
  if (!referrer) {
    return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
  }

  if (referrer.id === user.id) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
  }

  // Block duplicate pending referrals per referee — payout relies on
  // there being at most one, and two rows would either double-pay or
  // silently drop one party's reward.
  const existing = await payload.find({
    collection: 'referrals',
    where: {
      and: [{ referee: { equals: user.id } }, { status: { equals: 'pending' } }],
    },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    return NextResponse.json(
      { error: 'A pending referral already exists for this user' },
      { status: 409 },
    )
  }

  try {
    const created = await payload.create({
      collection: 'referrals',
      data: {
        referrer: referrer.id,
        referee: user.id,
        referralCode,
        status: 'pending',
      },
    })
    return NextResponse.json({ id: created.id, status: 'pending' }, { status: 201 })
  } catch (err) {
    payload.logger.error({ err, msg: 'referrals/create: insert failed' })
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 })
  }
}
