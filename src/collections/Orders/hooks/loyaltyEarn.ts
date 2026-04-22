import type { CollectionAfterChangeHook, Payload } from 'payload'
import { creditPoints, tierForLifetime, REFERRAL_REWARD_POINTS } from '@/lib/loyalty'

// Tier multipliers for the purchase-earn path. Kept here (not in
// @/lib/loyalty) because only purchase earnings are multiplied by
// tier; referral payouts are flat.
const TIER_MULTIPLIERS: Record<string, number> = {
  bronze: 1,
  silver: 1.25,
  gold: 1.5,
  platinum: 2,
}

export const loyaltyEarn: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  const payload = req.payload

  // --- On create: burn redeemed points immediately so the user can't
  // double-spend them on another tab. ---
  if (operation === 'create') {
    const redeemPoints = doc.totals?.pointsRedeemed ?? 0
    if (redeemPoints > 0) {
      const userId = extractUserId(doc)
      if (userId) {
        try {
          const existing = await payload.find({
            collection: 'loyalty-accounts',
            where: { user: { equals: userId } },
            limit: 1,
          })
          const currentAccount = existing.docs[0]
          if (currentAccount) {
            const newPoints = Math.max(0, (currentAccount.points ?? 0) - redeemPoints)
            await payload.update({
              collection: 'loyalty-accounts',
              id: currentAccount.id,
              data: { points: newPoints },
            })
            await payload.create({
              collection: 'loyalty-transactions',
              data: {
                user: userId as number,
                type: 'redeem',
                points: -redeemPoints,
                balance: newPoints,
                description: `Đổi điểm cho đơn ${doc.orderNumber} (-${redeemPoints} điểm)`,
                order: doc.id,
              },
            })
          }
        } catch (err) {
          payload.logger.error({ err, msg: 'loyaltyEarn: redeem deduction failed' })
        }
      }
    }
    return doc
  }

  // --- Referral payout fires on the referee's first transition to
  // `confirmed` — pays both sides 200 pts. Runs before the delivered
  // branch so a single status bump that somehow jumps past `confirmed`
  // still tries the payout (harmless: the referral-status guard
  // prevents double credit). ---
  const justConfirmed = previousDoc?.status !== 'confirmed' && doc.status === 'confirmed'
  if (justConfirmed) {
    try {
      await awardReferralRewards(doc, payload)
    } catch (err) {
      payload.logger.error({ err, msg: 'loyaltyEarn: referral payout failed' })
    }
  }

  // --- Purchase-earn fires on delivered (tier multiplier, 1 pt per
  // 10,000 VND). Separate trigger keeps the final payout gated on
  // completed delivery. ---
  const wasDelivered = previousDoc?.status !== 'delivered' && doc.status === 'delivered'
  if (!wasDelivered) return doc

  const userId = extractUserId(doc)
  if (!userId) return doc

  const total = doc.totals?.total ?? 0

  try {
    const existing = await payload.find({
      collection: 'loyalty-accounts',
      where: { user: { equals: userId } },
      limit: 1,
    })

    const currentAccount = existing.docs[0] ?? null
    const currentTier = (currentAccount?.tier as string) ?? 'bronze'
    const multiplier = TIER_MULTIPLIERS[currentTier] ?? 1
    const earnedPoints = Math.floor((total / 10000) * multiplier)
    if (earnedPoints <= 0) return doc

    await creditPoints({
      payload,
      userId,
      points: earnedPoints,
      type: 'earn_purchase',
      description: `Mua hàng đơn ${doc.orderNumber} (+${earnedPoints} điểm)`,
      orderId: doc.id,
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'loyaltyEarn hook failed' })
  }

  return doc
}

function extractUserId(doc: any): number | string | null {
  const u = doc.customerInfo?.user
  if (u == null) return null
  return typeof u === 'object' ? u.id : u
}

/**
 * Pay both parties of a pending referral 200 pts each. Idempotent via
 * the referral row's status — a second call sees `status: completed`
 * and no-ops. Also checks the referee has no prior confirmed orders
 * so a back-dated status edit on an old order can't re-fire it.
 */
async function awardReferralRewards(doc: any, payload: Payload): Promise<void> {
  const refereeId = extractUserId(doc)
  if (!refereeId) return

  const referrals = await payload.find({
    collection: 'referrals',
    where: {
      and: [{ referee: { equals: refereeId } }, { status: { equals: 'pending' } }],
    },
    limit: 1,
  })
  const referral = referrals.docs[0]
  if (!referral) return

  // Only pay on the referee's first confirmed order. Without this
  // guard a subsequent order could re-trigger payout before the
  // status-update lands (unlikely, but cheap to guard).
  const priorConfirmed = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { 'customerInfo.user': { equals: refereeId } },
        { status: { equals: 'confirmed' } },
        { id: { not_equals: doc.id } },
      ],
    },
    limit: 1,
  })
  if (priorConfirmed.docs.length > 0) return

  const referrerId =
    typeof referral.referrer === 'object' ? referral.referrer?.id : referral.referrer
  if (!referrerId) return
  if (referrerId === refereeId) return // defence-in-depth against self-referral

  const refereeLabel = doc.customerInfo?.email || doc.customerInfo?.name || `#${refereeId}`

  await creditPoints({
    payload,
    userId: referrerId,
    points: REFERRAL_REWARD_POINTS,
    type: 'earn_referral',
    description: `Thưởng giới thiệu bạn: ${refereeLabel} (+${REFERRAL_REWARD_POINTS} điểm)`,
    orderId: doc.id,
  })

  await creditPoints({
    payload,
    userId: refereeId,
    points: REFERRAL_REWARD_POINTS,
    type: 'earn_referral',
    description: `Thưởng đăng ký qua mã giới thiệu (+${REFERRAL_REWARD_POINTS} điểm)`,
    orderId: doc.id,
  })

  await payload.update({
    collection: 'referrals',
    id: referral.id,
    data: {
      status: 'completed',
      referrerReward: 'credited',
      refereeReward: 'credited',
      completedAt: new Date().toISOString(),
    },
  })
}

// Re-export for backwards compatibility with any caller that previously
// imported the tier helper from this file. Today there are none, but
// keep the symbol exported to avoid a silent gotcha during refactors.
export { tierForLifetime }
