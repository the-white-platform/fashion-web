import type { CollectionAfterChangeHook } from 'payload'

// Tier multipliers for point calculation
const TIER_MULTIPLIERS: Record<string, number> = {
  bronze: 1,
  silver: 1.25,
  gold: 1.5,
  platinum: 2,
}

// Tier thresholds based on lifetime points
const TIER_THRESHOLDS = {
  platinum: 50000,
  gold: 20000,
  silver: 5000,
  bronze: 0,
}

function calculateTier(lifetimePoints: number): string {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum'
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold'
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

export const loyaltyEarn: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  const payload = req.payload

  // Handle points redemption deduction on order creation
  if (operation === 'create') {
    const redeemPoints = doc.totals?.pointsRedeemed ?? 0
    if (redeemPoints > 0) {
      const userId =
        typeof doc.customerInfo?.user === 'object'
          ? doc.customerInfo.user?.id
          : doc.customerInfo?.user

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
                user: userId,
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

  // Only trigger when status changes to 'delivered'
  const wasDelivered = previousDoc?.status !== 'delivered' && doc.status === 'delivered'
  if (!wasDelivered) return doc

  const userId =
    typeof doc.customerInfo?.user === 'object' ? doc.customerInfo.user?.id : doc.customerInfo?.user

  if (!userId) return doc

  const total = doc.totals?.total ?? 0

  try {
    // Look up existing loyalty account
    const existing = await payload.find({
      collection: 'loyalty-accounts',
      where: { user: { equals: userId } },
      limit: 1,
    })

    const currentAccount = existing.docs[0] ?? null
    const currentTier = (currentAccount?.tier as string) ?? 'bronze'
    const multiplier = TIER_MULTIPLIERS[currentTier] ?? 1

    // Calculate earned points: 1 point per 10,000 VND × tier multiplier
    const earnedPoints = Math.floor((total / 10000) * multiplier)
    if (earnedPoints <= 0) return doc

    let newPoints: number
    let newLifetimePoints: number
    let newTier: string

    if (currentAccount) {
      newPoints = (currentAccount.points ?? 0) + earnedPoints
      newLifetimePoints = (currentAccount.lifetimePoints ?? 0) + earnedPoints
      newTier = calculateTier(newLifetimePoints)

      await payload.update({
        collection: 'loyalty-accounts',
        id: currentAccount.id,
        data: {
          points: newPoints,
          lifetimePoints: newLifetimePoints,
          tier: newTier as any,
          ...(newTier !== currentTier ? { tierUpdatedAt: new Date().toISOString() } : {}),
        },
      })
    } else {
      newPoints = earnedPoints
      newLifetimePoints = earnedPoints
      newTier = calculateTier(newLifetimePoints)

      await payload.create({
        collection: 'loyalty-accounts',
        data: {
          user: userId,
          points: newPoints,
          lifetimePoints: newLifetimePoints,
          tier: newTier as any,
          tierUpdatedAt: new Date().toISOString(),
        },
      })
    }

    // Create loyalty transaction
    await payload.create({
      collection: 'loyalty-transactions',
      data: {
        user: userId,
        type: 'earn_purchase',
        points: earnedPoints,
        balance: newPoints,
        description: `Mua hàng đơn ${doc.orderNumber} (+${earnedPoints} điểm)`,
        order: doc.id,
      },
    })

    // Check referral: award referrer 200 points on referee's first delivered order
    await awardReferrerIfFirstOrder(userId, doc.id, payload)
  } catch (err) {
    req.payload.logger.error({ err, msg: 'loyaltyEarn hook failed' })
  }

  return doc
}

async function awardReferrerIfFirstOrder(
  userId: string | number,
  orderId: string | number,
  payload: any,
) {
  // Find a pending referral where this user is the referee
  const referrals = await payload.find({
    collection: 'referrals',
    where: {
      and: [{ referee: { equals: userId } }, { status: { equals: 'pending' } }],
    },
    limit: 1,
  })

  const referral = referrals.docs[0]
  if (!referral) return

  // Check that this is the referee's first delivered order
  const previousOrders = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { 'customerInfo.user': { equals: userId } },
        { status: { equals: 'delivered' } },
        { id: { not_equals: orderId } },
      ],
    },
    limit: 1,
  })

  if (previousOrders.docs.length > 0) return // Not their first delivered order

  const referrerId =
    typeof referral.referrer === 'object' ? referral.referrer?.id : referral.referrer

  if (!referrerId) return

  // Credit 200 points to referrer
  const referrerAccount = await payload.find({
    collection: 'loyalty-accounts',
    where: { user: { equals: referrerId } },
    limit: 1,
  })

  const refAcct = referrerAccount.docs[0]
  const currentPoints = refAcct?.points ?? 0
  const currentLifetime = refAcct?.lifetimePoints ?? 0
  const newPoints = currentPoints + 200
  const newLifetime = currentLifetime + 200
  const newTier = calculateTier(newLifetime)

  if (refAcct) {
    await payload.update({
      collection: 'loyalty-accounts',
      id: refAcct.id,
      data: {
        points: newPoints,
        lifetimePoints: newLifetime,
        tier: newTier as any,
        ...(newTier !== (refAcct.tier as string)
          ? { tierUpdatedAt: new Date().toISOString() }
          : {}),
      },
    })
  } else {
    await payload.create({
      collection: 'loyalty-accounts',
      data: {
        user: referrerId,
        points: newPoints,
        lifetimePoints: newLifetime,
        tier: newTier as any,
        tierUpdatedAt: new Date().toISOString(),
      },
    })
  }

  await payload.create({
    collection: 'loyalty-transactions',
    data: {
      user: referrerId,
      type: 'earn_referral',
      points: 200,
      balance: newPoints,
      description: 'Thưởng giới thiệu bạn bè (+200 điểm)',
    },
  })

  // Mark referral as completed
  await payload.update({
    collection: 'referrals',
    id: referral.id,
    data: {
      status: 'completed',
      referrerReward: 'credited',
      completedAt: new Date().toISOString(),
    },
  })
}
