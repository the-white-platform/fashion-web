import type { ProductForFrontend } from './getProducts'
import { getRelatedProducts } from './getRelatedProducts'

export interface GetRecommendationsOptions {
  userId?: string | number | null
  productId?: number | null
  categoryIds?: string[]
  limit?: number
  locale?: 'vi' | 'en'
}

/**
 * Get product recommendations based on context.
 * Falls back gracefully through: purchase-history → similar → popular.
 */
export async function getRecommendations(
  options: GetRecommendationsOptions,
): Promise<ProductForFrontend[]> {
  const { userId, productId, categoryIds, limit = 8, locale = 'vi' } = options

  // Import payload lazily to avoid server/client boundary issues
  const { default: configPromise } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const { transformProduct } = await import('./getProducts')

  const payload = await getPayload({ config: configPromise })

  // Step 1: If we have a userId, try purchase-history based recommendations
  if (userId) {
    try {
      // Get products the user has purchased
      const orders = await payload.find({
        collection: 'orders',
        where: {
          and: [{ 'customerInfo.user': { equals: userId } }, { status: { equals: 'delivered' } }],
        },
        limit: 10,
        depth: 0,
      })

      // Collect purchased product IDs
      const purchasedIds = new Set<number>()
      const purchasedCategoryIds = new Set<string>()

      for (const order of orders.docs) {
        for (const item of (order.items as any[]) ?? []) {
          const pid = typeof item.product === 'object' ? item.product?.id : item.product
          if (pid) purchasedIds.add(pid)
        }
      }

      // Fetch categories of purchased products
      if (purchasedIds.size > 0) {
        const purchasedProducts = await payload.find({
          collection: 'products',
          where: { id: { in: Array.from(purchasedIds) } },
          limit: 50,
          depth: 1,
        })

        for (const p of purchasedProducts.docs) {
          const cats = Array.isArray(p.category) ? p.category : p.category ? [p.category] : []
          for (const c of cats) {
            const cId = typeof c === 'object' ? String(c.id) : String(c)
            purchasedCategoryIds.add(cId)
          }
        }

        // Find products in same categories, excluding already purchased
        if (purchasedCategoryIds.size > 0) {
          const recommended = await payload.find({
            collection: 'products',
            where: {
              and: [{ id: { not_in: Array.from(purchasedIds) } }, { inStock: { equals: true } }],
            },
            sort: '-averageRating',
            limit: limit * 2,
            depth: 1,
            locale,
          })

          const result = recommended.docs
            .map((p) => transformProduct(p as any, locale))
            .slice(0, limit)

          if (result.length >= Math.min(limit, 4)) return result
        }
      }
    } catch {
      // Fall through to next strategy
    }
  }

  // Step 2: If we have a productId, get similar products
  if (productId) {
    try {
      const { transformProduct } = await import('./getProducts')

      const currentProduct = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 1,
        locale,
      })

      const allProducts = await payload.find({
        collection: 'products',
        where: { inStock: { equals: true } },
        limit: 100,
        depth: 1,
        locale,
      })

      const allTransformed = allProducts.docs.map((p) => transformProduct(p as any, locale))
      const currentTransformed = transformProduct(currentProduct as any, locale)

      const related = getRelatedProducts(currentTransformed, allTransformed, limit)
      if (related.length > 0) return related
    } catch {
      // Fall through to fallback
    }
  }

  // Step 3: Category-based fallback
  if (categoryIds && categoryIds.length > 0) {
    try {
      const { transformProduct } = await import('./getProducts')

      const catProducts = await payload.find({
        collection: 'products',
        where: {
          and: [{ inStock: { equals: true } }],
        },
        sort: '-averageRating',
        limit: limit,
        depth: 1,
        locale,
      })

      return catProducts.docs.map((p) => transformProduct(p as any, locale)).slice(0, limit)
    } catch {
      // Fall through to popular
    }
  }

  // Step 4: Popular products fallback (sort by rating / featured)
  try {
    const { transformProduct } = await import('./getProducts')

    const popular = await payload.find({
      collection: 'products',
      where: { inStock: { equals: true } },
      sort: '-averageRating',
      limit,
      depth: 1,
      locale,
    })

    return popular.docs.map((p) => transformProduct(p as any, locale))
  } catch {
    return []
  }
}
