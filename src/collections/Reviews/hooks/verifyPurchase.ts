import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Before-change hook (create only).
 * Checks whether the reviewer has a delivered/confirmed order containing
 * the reviewed product. If found, marks the review as verified and
 * auto-approves it; otherwise marks as pending for moderation.
 */
export const verifyPurchase: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const payload = req.payload
  const userId = typeof data.user === 'object' ? data.user?.id : data.user
  const productId = typeof data.product === 'object' ? data.product?.id : data.product

  if (!userId || !productId) return data

  try {
    const orders = await payload.find({
      collection: 'orders',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { 'customerInfo.user': { equals: userId } },
          { 'items.product': { equals: productId } },
          {
            or: [{ status: { equals: 'delivered' } }, { status: { equals: 'confirmed' } }],
          },
        ],
      },
    })

    if (orders.docs.length > 0) {
      data.verified = true
      data.moderationStatus = 'approved'
      data.order = orders.docs[0].id
    } else {
      data.verified = false
      data.moderationStatus = 'pending'
    }
  } catch {
    data.verified = false
    data.moderationStatus = 'pending'
  }

  return data
}
