import type { CollectionAfterChangeHook } from 'payload'

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

export const loyaltyEarnReview: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  // Only trigger when moderationStatus changes to 'approved'
  const wasApproved =
    previousDoc?.moderationStatus !== 'approved' && doc.moderationStatus === 'approved'
  if (!wasApproved) return doc

  const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user

  if (!userId) return doc

  const pointsToAward = doc.verified ? 100 : 50
  const payload = req.payload

  try {
    const existing = await payload.find({
      collection: 'loyalty-accounts',
      where: { user: { equals: userId } },
      limit: 1,
    })

    const currentAccount = existing.docs[0] ?? null
    let newPoints: number
    let newLifetime: number
    let newTier: string

    if (currentAccount) {
      newPoints = (currentAccount.points ?? 0) + pointsToAward
      newLifetime = (currentAccount.lifetimePoints ?? 0) + pointsToAward
      newTier = calculateTier(newLifetime)

      await payload.update({
        collection: 'loyalty-accounts',
        id: currentAccount.id,
        data: {
          points: newPoints,
          lifetimePoints: newLifetime,
          tier: newTier as any,
          ...(newTier !== (currentAccount.tier as string)
            ? { tierUpdatedAt: new Date().toISOString() }
            : {}),
        },
      })
    } else {
      newPoints = pointsToAward
      newLifetime = pointsToAward
      newTier = calculateTier(newLifetime)

      await payload.create({
        collection: 'loyalty-accounts',
        data: {
          user: userId,
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
        user: userId,
        type: 'earn_review',
        points: pointsToAward,
        balance: newPoints,
        description: doc.verified
          ? `Đánh giá đã xác nhận mua hàng (+${pointsToAward} điểm)`
          : `Đánh giá sản phẩm (+${pointsToAward} điểm)`,
        review: doc.id,
      },
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'loyaltyEarnReview hook failed' })
  }

  return doc
}
