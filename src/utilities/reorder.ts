'use client'

export interface ReorderItem {
  product: string | number
  productName: string
  variant?: string | null
  size: string
  quantity: number
  unitPrice: number
  productImage?: string | null
}

export interface AddToCartFn {
  (item: {
    id: number
    name: string
    price: number
    color?: string
    size: string
    quantity: number
    image: string
  }): void
}

/**
 * Re-orders items from a previous order into the cart.
 * Checks stock for each item and skips out-of-stock ones.
 * Returns a summary of added and skipped items.
 */
export async function reorderItems(
  items: ReorderItem[],
  addToCart: AddToCartFn,
): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0

  for (const item of items) {
    const productId = typeof item.product === 'object' ? (item.product as any)?.id : item.product

    if (!productId) {
      skipped++
      continue
    }

    try {
      // Check current stock
      const res = await fetch(`/api/products/${productId}?depth=0`)
      if (!res.ok) {
        skipped++
        continue
      }

      const product = await res.json()

      // Check if product is in stock
      if (product.inStock === false) {
        skipped++
        continue
      }

      // Check variant/size stock
      let variantInStock = true
      if (product.variants && Array.isArray(product.variants)) {
        const variant = product.variants.find(
          (v: any) =>
            (!item.variant || v.color === item.variant) &&
            v.sizes?.some((s: any) => s.size === item.size && s.inStock !== false),
        )
        if (!variant) variantInStock = false
      }

      if (!variantInStock) {
        skipped++
        continue
      }

      addToCart({
        id: Number(productId),
        name: item.productName,
        price: item.unitPrice,
        color: item.variant ?? undefined,
        size: item.size,
        quantity: item.quantity,
        image: item.productImage ?? '',
      })
      added++
    } catch {
      skipped++
    }
  }

  return { added, skipped }
}
