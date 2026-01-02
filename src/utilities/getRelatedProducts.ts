import type { ProductForFrontend } from './getProducts'

/**
 * Calculate a similarity score between two products
 * Higher score = more similar
 */
function calculateSimilarity(product1: ProductForFrontend, product2: ProductForFrontend): number {
  let score = 0

  // Same primary category (highest weight)
  if (product1.category === product2.category) {
    score += 50
  }

  // Shared categories (medium weight)
  const sharedCategories = product1.categories.filter((cat) => product2.categories.includes(cat))
  score += sharedCategories.length * 15

  // Similar price range (±30%)
  const priceDiff = Math.abs(product1.priceNumber - product2.priceNumber)
  const avgPrice = (product1.priceNumber + product2.priceNumber) / 2
  const pricePercentDiff = (priceDiff / avgPrice) * 100

  if (pricePercentDiff <= 10) {
    score += 20
  } else if (pricePercentDiff <= 20) {
    score += 15
  } else if (pricePercentDiff <= 30) {
    score += 10
  }

  // Same tag
  if (product1.tag === product2.tag) {
    score += 10
  }

  // Shared colors
  const sharedColors = product1.colors.filter((c1) =>
    product2.colors.some((c2) => c2.hex === c1.hex),
  )
  score += sharedColors.length * 5

  // Shared sizes
  const sharedSizes = product1.sizes.filter((s) => product2.sizes.includes(s))
  score += sharedSizes.length * 3

  // Both featured or both not featured
  if (product1.featured === product2.featured) {
    score += 5
  }

  return score
}

/**
 * Get related products for a given product
 * @param currentProduct The product to find related items for
 * @param allProducts All available products
 * @param limit Maximum number of related products to return (default: 4)
 * @returns Array of related products sorted by relevance
 */
export function getRelatedProducts(
  currentProduct: ProductForFrontend,
  allProducts: ProductForFrontend[],
  limit: number = 4,
): ProductForFrontend[] {
  // Filter out the current product
  const otherProducts = allProducts.filter((p) => p.id !== currentProduct.id)

  // Calculate similarity scores
  const productsWithScores = otherProducts.map((product) => ({
    product,
    score: calculateSimilarity(currentProduct, product),
  }))

  // Sort by score (highest first) and take top N
  const relatedProducts = productsWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product)

  // If we don't have enough related products, fill with random products from same category
  if (relatedProducts.length < limit) {
    const sameCategoryProducts = otherProducts
      .filter(
        (p) =>
          p.category === currentProduct.category && !relatedProducts.some((rp) => rp.id === p.id),
      )
      .slice(0, limit - relatedProducts.length)

    relatedProducts.push(...sameCategoryProducts)
  }

  // If still not enough, fill with any random products
  if (relatedProducts.length < limit) {
    const remainingProducts = otherProducts
      .filter((p) => !relatedProducts.some((rp) => rp.id === p.id))
      .slice(0, limit - relatedProducts.length)

    relatedProducts.push(...remainingProducts)
  }

  return relatedProducts
}
