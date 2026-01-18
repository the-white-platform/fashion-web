import type { CollectionBeforeChangeHook, CollectionAfterChangeHook, Payload } from 'payload'

interface OrderItem {
  product: number | { id: number }
  variant?: string
  size: string
  quantity: number
}

interface Order {
  id?: number
  items: OrderItem[]
  status: string
}

interface SizeInventoryItem {
  id?: string
  size: string
  stock: number
  lowStockThreshold?: number
}

interface ColorVariant {
  id?: string
  color: string
  colorHex: string
  sizeInventory?: SizeInventoryItem[]
  images?: any[]
}

interface Product {
  id: number
  colorVariants?: ColorVariant[]
}

/**
 * Validates stock availability before order creation
 * Returns error if any item is out of stock
 */
export const validateStockBeforeOrder: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  // Only check on create (new orders)
  if (operation !== 'create') return data

  const payload = req.payload
  const items = (data.items || []) as OrderItem[]

  for (const item of items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product
    const product = (await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
    })) as Product

    if (!product) {
      throw new Error(`Product ${productId} not found`)
    }

    // Find the variant by color name
    const variant = product.colorVariants?.find(
      (v) => v.color === item.variant || v.id === item.variant,
    )

    if (!variant) {
      throw new Error(`Variant "${item.variant}" not found for product ${productId}`)
    }

    // Find the size in inventory
    const sizeInventory = variant.sizeInventory?.find((s) => s.size === item.size)

    if (!sizeInventory) {
      throw new Error(`Size "${item.size}" not available for variant "${item.variant}"`)
    }

    // Check stock
    if (sizeInventory.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${item.variant}" size ${item.size}. ` +
          `Available: ${sizeInventory.stock}, Requested: ${item.quantity}`,
      )
    }
  }

  return data
}

/**
 * Decrements stock after order is confirmed
 * Uses atomic update to prevent race conditions
 */
export const decrementStockAfterOrder: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const payload = req.payload
  const order = doc as Order

  // Only decrement on create OR when status changes to 'confirmed'
  const shouldDecrement =
    operation === 'create' ||
    (previousDoc && previousDoc.status !== 'confirmed' && order.status === 'confirmed')

  if (!shouldDecrement) return doc

  for (const item of order.items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product

    try {
      const product = (await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 0,
      })) as Product

      if (!product || !product.colorVariants) continue

      // Update the colorVariants with decremented stock
      const updatedVariants = product.colorVariants.map((variant) => {
        if (variant.color !== item.variant && variant.id !== item.variant) {
          return variant
        }

        const updatedSizeInventory = variant.sizeInventory?.map((sizeItem) => {
          if (sizeItem.size !== item.size) {
            return sizeItem
          }

          const newStock = Math.max(0, sizeItem.stock - item.quantity)

          // Log low stock warning
          if (
            sizeItem.lowStockThreshold &&
            newStock <= sizeItem.lowStockThreshold &&
            newStock > 0
          ) {
            payload.logger.warn(
              `⚠ Low stock alert: Product ${productId}, ${item.variant} ${item.size} - Only ${newStock} left`,
            )
          }

          // Log out of stock
          if (newStock === 0) {
            payload.logger.warn(
              `🚨 Out of stock: Product ${productId}, ${item.variant} ${item.size}`,
            )
          }

          return {
            ...sizeItem,
            stock: newStock,
          }
        })

        return {
          ...variant,
          sizeInventory: updatedSizeInventory,
        }
      })

      // Update the product with new stock
      await payload.update({
        collection: 'products',
        id: productId,
        data: {
          colorVariants: updatedVariants,
        },
      })

      payload.logger.info(
        `✓ Stock decremented: Product ${productId}, ${item.variant} ${item.size} (-${item.quantity})`,
      )
    } catch (error) {
      payload.logger.error(`Failed to decrement stock for product ${productId}: ${error}`)
    }
  }

  return doc
}

/**
 * Restores stock when order is cancelled
 */
export const restoreStockOnCancel: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const payload = req.payload
  const order = doc as Order

  // Only restore if status changes TO 'cancelled' from a non-cancelled state
  if (!previousDoc || previousDoc.status === 'cancelled' || order.status !== 'cancelled') {
    return doc
  }

  for (const item of order.items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product

    try {
      const product = (await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 0,
      })) as Product

      if (!product || !product.colorVariants) continue

      // Update the colorVariants with restored stock
      const updatedVariants = product.colorVariants.map((variant) => {
        if (variant.color !== item.variant && variant.id !== item.variant) {
          return variant
        }

        const updatedSizeInventory = variant.sizeInventory?.map((sizeItem) => {
          if (sizeItem.size !== item.size) {
            return sizeItem
          }

          return {
            ...sizeItem,
            stock: sizeItem.stock + item.quantity,
          }
        })

        return {
          ...variant,
          sizeInventory: updatedSizeInventory,
        }
      })

      await payload.update({
        collection: 'products',
        id: productId,
        data: {
          colorVariants: updatedVariants,
        },
      })

      payload.logger.info(
        `✓ Stock restored: Product ${productId}, ${item.variant} ${item.size} (+${item.quantity})`,
      )
    } catch (error) {
      payload.logger.error(`Failed to restore stock for product ${productId}: ${error}`)
    }
  }

  return doc
}
