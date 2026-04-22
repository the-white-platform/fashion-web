import type { Payload } from 'payload'

// One point = 100 VND in the redemption flow. Reward amounts are kept
// here rather than a Payload global because marketing doesn't change
// them often and having them live in code keeps payout logic
// self-contained and easy to audit.
export const REFERRAL_REWARD_POINTS = 200

// Tier thresholds mirror the ones in the loyaltyEarn hook + the
// /loyalty page client. Kept in sync manually — any change here needs
// matching edits in both callers.
const TIER_THRESHOLDS = {
  platinum: 50_000,
  gold: 20_000,
  silver: 5_000,
  bronze: 0,
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export function tierForLifetime(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum'
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold'
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

export type LoyaltyTxType =
  | 'earn_purchase'
  | 'earn_review'
  | 'earn_referral'
  | 'redeem'
  | 'expire'
  | 'adjustment'

interface CreditPointsArgs {
  payload: Payload
  userId: number | string
  points: number
  type: LoyaltyTxType
  description: string
  orderId?: number | string
}

/**
 * Credit points to a user's loyalty account and append a matching
 * transaction row. Creates the account on demand. Returns the new
 * balance so callers can log it, but all errors are rethrown —
 * wrapping in try/catch is the caller's choice.
 */
export async function creditPoints({
  payload,
  userId,
  points,
  type,
  description,
  orderId,
}: CreditPointsArgs): Promise<number> {
  if (points <= 0) {
    throw new Error(`creditPoints requires positive points, got ${points}`)
  }

  const existing = await payload.find({
    collection: 'loyalty-accounts',
    where: { user: { equals: userId } },
    limit: 1,
  })

  const current = existing.docs[0]
  const currentPoints = current?.points ?? 0
  const currentLifetime = current?.lifetimePoints ?? 0
  const newPoints = currentPoints + points
  const newLifetime = currentLifetime + points
  const newTier = tierForLifetime(newLifetime)
  const currentTier = (current?.tier as LoyaltyTier | undefined) ?? 'bronze'
  const tierChanged = newTier !== currentTier

  if (current) {
    await payload.update({
      collection: 'loyalty-accounts',
      id: current.id,
      data: {
        points: newPoints,
        lifetimePoints: newLifetime,
        tier: newTier,
        ...(tierChanged ? { tierUpdatedAt: new Date().toISOString() } : {}),
      },
    })
  } else {
    await payload.create({
      collection: 'loyalty-accounts',
      data: {
        user: userId as number,
        points: newPoints,
        lifetimePoints: newLifetime,
        tier: newTier,
        tierUpdatedAt: new Date().toISOString(),
      },
    })
  }

  await payload.create({
    collection: 'loyalty-transactions',
    data: {
      user: userId as number,
      type,
      points,
      balance: newPoints,
      description,
      ...(orderId != null ? { order: orderId as number } : {}),
    },
  })

  return newPoints
}
