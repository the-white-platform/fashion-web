import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * After-change / after-delete hook.
 * Recomputes averageRating and reviewCount on the related product
 * by querying all approved reviews for that product.
 *
 * Uses raw SQL to write the two scalar columns. payload.update on
 * products triggers Payload's full-product replace cascade — every
 * color variant and media relation is re-written, which idles a
 * transaction on SELECT media and stalls the review POST at 300s.
 * Same trap that bit decrementStockAfterOrder.
 */
async function recalcProductRating(productId: number | string, payload: any): Promise<void> {
  const reviews = await payload.find({
    collection: 'reviews',
    depth: 0,
    limit: 0, // fetch all
    pagination: false,
    where: {
      and: [{ product: { equals: productId } }, { moderationStatus: { equals: 'approved' } }],
    },
  })

  const count: number = reviews.totalDocs
  let avg = 0
  if (count > 0) {
    const sum = (reviews.docs as Array<{ rating: number }>).reduce((acc, r) => acc + r.rating, 0)
    avg = Math.round((sum / count) * 10) / 10
  }

  const { sql } = await import('drizzle-orm')
  const db = (
    payload.db as unknown as {
      drizzle: { execute: (q: ReturnType<typeof sql>) => Promise<unknown> }
    }
  ).drizzle

  await db.execute(sql`
    UPDATE products
    SET average_rating = ${avg}, review_count = ${count}
    WHERE id = ${Number(productId)}
  `)
}

export const updateProductRating: CollectionAfterChangeHook = async ({ doc, req }) => {
  const productId = typeof doc.product === 'object' ? doc.product?.id : doc.product
  if (!productId) return doc

  try {
    await recalcProductRating(productId, req.payload)
  } catch {
    // Non-fatal — rating denormalization failure should not break the review save
  }

  return doc
}

/**
 * Also exported for use in afterDelete hook.
 */
export const updateProductRatingAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const productId = typeof doc.product === 'object' ? doc.product?.id : doc.product
  if (!productId) return

  try {
    await recalcProductRating(productId, req.payload)
  } catch {
    // Non-fatal
  }
}
