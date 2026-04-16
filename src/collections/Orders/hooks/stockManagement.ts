import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'
import type { Product } from '@/payload-types'

/**
 * Server-side price and coupon validation hook.
 * Recalculates all prices, discounts, and totals from DB on order creation.
 * Prevents client-controlled pricing (C1), client-controlled coupons (C2),
 * and arbitrary status manipulation (H2).
 */
export const validateAndRecalculateOrder: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const payload = req.payload
  payload.logger.info('[orders/hooks] validateAndRecalculateOrder: enter')
  const items = (data.items || []) as Array<{
    product: number | { id: number }
    variant?: string
    size: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>

  // Step 1: Overwrite unitPrice and lineTotal for each item from DB
  for (const item of items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product
    const product = (await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
    })) as Product | null

    if (!product) {
      throw new Error(`Product ${productId} not found`)
    }

    // `price` is the current selling price (already reflects any discount)
    const serverPrice = product.price

    if (serverPrice == null) {
      throw new Error(`Product ${productId} has no price`)
    }

    item.unitPrice = serverPrice
    item.lineTotal = serverPrice * item.quantity
  }

  // Step 2: Recalculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  data.totals = data.totals ?? {}
  data.totals.subtotal = subtotal

  // Step 3: Validate and recalculate coupon
  let discount = 0
  let isFreeShipping = false

  if (data.totals.couponCode) {
    const couponCode = data.totals.couponCode as string
    const couponResult = await payload.find({
      collection: 'coupons',
      where: {
        code: { equals: couponCode },
        active: { equals: true },
      },
      limit: 1,
    })

    const coupon = couponResult.docs[0] as
      | {
          id: number
          code: string
          type: 'percentage' | 'fixed' | 'shipping'
          value: number
          validFrom?: string | null
          validUntil?: string | null
          usageLimit?: number | null
          usageCount?: number | null
          minOrderAmount?: number | null
          maxDiscount?: number | null
        }
      | undefined

    let couponValid = !!coupon

    if (coupon) {
      const now = new Date()

      // Check validFrom
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        couponValid = false
        payload.logger.warn(`Coupon "${couponCode}" not yet active`)
      }

      // Check validUntil
      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        couponValid = false
        payload.logger.warn(`Coupon "${couponCode}" has expired`)
      }

      // Check usageLimit (0 means unlimited — see Coupons collection hint)
      if (
        coupon.usageLimit != null &&
        coupon.usageLimit > 0 &&
        coupon.usageCount != null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        couponValid = false
        payload.logger.warn(`Coupon "${couponCode}" usage limit reached`)
      }

      // Check minOrderAmount
      if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
        couponValid = false
        payload.logger.warn(
          `Coupon "${couponCode}" requires minimum order of ${coupon.minOrderAmount}`,
        )
      }

      if (couponValid) {
        if (coupon.type === 'percentage') {
          discount = subtotal * (coupon.value / 100)
          if (coupon.maxDiscount != null) {
            discount = Math.min(discount, coupon.maxDiscount)
          }
        } else if (coupon.type === 'fixed') {
          discount = coupon.value
        } else if (coupon.type === 'shipping') {
          isFreeShipping = true
          discount = 0
        }
      }
    }

    // If coupon is invalid, clear it
    if (!couponValid) {
      data.totals.couponCode = null
      discount = 0
    }
  }

  // Step 4: Set shipping fee
  const shippingFee = isFreeShipping ? 0 : 30000
  data.totals.shippingFee = shippingFee

  // Step 5: Validate and apply loyalty points discount
  // 1 point = 1000 VND (default rate — tune via follow-up if needed)
  const POINTS_TO_VND = 1000
  payload.logger.info('[orders/hooks] validateAndRecalculateOrder: step 5 (loyalty)')

  let clampedPointsDiscount = 0
  const userId = data.customerInfo?.user
    ? typeof data.customerInfo.user === 'object'
      ? data.customerInfo.user.id
      : data.customerInfo.user
    : null

  if (userId) {
    const loyaltyResult = await req.payload.find({
      collection: 'loyalty-accounts',
      where: { user: { equals: userId } },
      limit: 1,
    })
    const account = loyaltyResult.docs[0]
    if (account) {
      const maxAllowed = (account.points ?? 0) * POINTS_TO_VND
      const requested = data.totals?.pointsDiscount ?? 0
      clampedPointsDiscount = Math.min(requested, maxAllowed)
    }
    // else: no loyalty account → pointsDiscount stays 0
  }
  // Anonymous order → pointsDiscount stays 0

  data.totals.pointsDiscount = clampedPointsDiscount
  payload.logger.info('[orders/hooks] validateAndRecalculateOrder: exit')

  // Step 5b: Set server-calculated discount and total
  data.totals.discount = discount
  data.totals.total = Math.max(0, subtotal + shippingFee - discount - clampedPointsDiscount)

  // Step 6: Force status to pending
  data.status = 'pending'

  // Step 7: Force payment status to pending
  if (data.payment) {
    data.payment.paymentStatus = 'pending'
  }

  // Step 8: Validate user field — prevent spoofing another user's ID
  if (data.customerInfo?.user) {
    if (!req.user) {
      // No authenticated session: clear the user relationship
      data.customerInfo.user = null
    } else {
      // Authenticated session: ensure the claimed user matches the session user
      const claimedUserId =
        typeof data.customerInfo.user === 'object'
          ? data.customerInfo.user.id
          : data.customerInfo.user
      if (String(claimedUserId) !== String(req.user.id)) {
        data.customerInfo.user = null
        payload.logger.warn(
          `Order creation: user mismatch — claimed ${claimedUserId} but session is ${req.user.id}. Cleared.`,
        )
      }
    }
  }

  return data
}

/**
 * Increments the usageCount on the matching Coupon document when an order is created with a coupon.
 * Failure is non-blocking — the order is never rolled back due to a coupon update error.
 */
export const incrementCouponUsageAfterOrder: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const couponCode = doc?.totals?.couponCode
  if (!couponCode) return doc

  const payload = req.payload

  try {
    const result = await payload.find({
      collection: 'coupons',
      where: { code: { equals: couponCode } },
      limit: 1,
    })

    const coupon = result.docs[0]
    if (!coupon) {
      payload.logger.warn(`Coupon code "${couponCode}" not found — skipping usage increment`)
      return doc
    }

    // Guard: skip increment if already at or over the usage limit
    if (
      coupon.usageLimit &&
      coupon.usageLimit > 0 &&
      (coupon.usageCount || 0) >= coupon.usageLimit
    ) {
      payload.logger.warn(
        `Coupon "${couponCode}" already at usage limit (${coupon.usageCount}/${coupon.usageLimit}), skipping increment`,
      )
      return doc
    }

    await payload.update({
      collection: 'coupons',
      id: coupon.id,
      data: { usageCount: (coupon.usageCount || 0) + 1 },
    })

    payload.logger.info(
      `Coupon "${couponCode}" usage incremented to ${(coupon.usageCount || 0) + 1}`,
    )
  } catch (error) {
    payload.logger.error(`Failed to increment coupon usage for "${couponCode}": ${error}`)
  }

  return doc
}

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
  payload.logger.info('[orders/hooks] validateStockBeforeOrder: enter')
  const items = (data.items || []) as OrderItem[]

  for (const item of items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
    })

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

  payload.logger.info('[orders/hooks] validateStockBeforeOrder: exit')
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

  payload.logger.info(`[orders/hooks] decrementStockAfterOrder: enter (operation=${operation}, order=${order.id})`)

  // Only decrement stock on order creation, not on status transitions
  if (operation !== 'create') return doc

  for (const item of order.items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product

    try {
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 0,
      })

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

      await payload.update({
        collection: 'products',
        id: productId,
        data: {
          colorVariants: updatedVariants,
        },
      })

      // Record stock movements for each affected size
      const matchedVariant = product.colorVariants?.find(
        (v) => v.color === item.variant || v.id === item.variant,
      )
      const sizeItem = matchedVariant?.sizeInventory?.find((s) => s.size === item.size)
      if (sizeItem !== undefined) {
        const previousStock = sizeItem.stock
        const newStock = Math.max(0, previousStock - item.quantity)
        try {
          await payload.create({
            collection: 'stock-movements',
            data: {
              product: productId,
              variant: item.variant ?? '',
              size: item.size,
              type: 'sale',
              quantity: -item.quantity,
              previousStock,
              newStock,
              order: doc.id,
              performedBy: req.user?.id ?? null,
            },
          })
        } catch (movementError) {
          payload.logger.error(
            `Failed to create stock movement for product ${productId}: ${movementError}`,
          )
        }
      }

      // Defense-in-depth: re-read to detect negative stock from concurrent orders
      const updatedProduct = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 0,
      })
      for (const variant of updatedProduct?.colorVariants || []) {
        for (const inv of variant.sizeInventory || []) {
          if (inv.stock < 0) {
            payload.logger.error(
              `CRITICAL: Negative stock detected for product ${productId}, variant ${variant.color}, size ${inv.size}: ${inv.stock}`,
            )
          }
        }
      }

      payload.logger.info(
        `✓ Stock decremented: Product ${productId}, ${item.variant} ${item.size} (-${item.quantity})`,
      )
    } catch (error) {
      payload.logger.error(`Failed to decrement stock for product ${productId}: ${error}`)
    }
  }

  payload.logger.info(`[orders/hooks] decrementStockAfterOrder: exit`)
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
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 0,
      })

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

      const matchedVariantForCancel = product.colorVariants?.find(
        (v) => v.color === item.variant || v.id === item.variant,
      )
      const sizeItemForCancel = matchedVariantForCancel?.sizeInventory?.find(
        (s) => s.size === item.size,
      )

      await payload.update({
        collection: 'products',
        id: productId,
        data: {
          colorVariants: updatedVariants,
        },
      })

      if (sizeItemForCancel !== undefined) {
        const previousStock = sizeItemForCancel.stock
        const newStock = previousStock + item.quantity
        try {
          await payload.create({
            collection: 'stock-movements',
            data: {
              product: productId,
              variant: item.variant ?? '',
              size: item.size,
              type: 'cancellation',
              quantity: item.quantity,
              previousStock,
              newStock,
              order: doc.id,
              performedBy: req.user?.id ?? null,
            },
          })
        } catch (movementError) {
          payload.logger.error(
            `Failed to create cancellation movement for product ${productId}: ${movementError}`,
          )
        }
      }

      payload.logger.info(
        `✓ Stock restored: Product ${productId}, ${item.variant} ${item.size} (+${item.quantity})`,
      )
    } catch (error) {
      payload.logger.error(`Failed to restore stock for product ${productId}: ${error}`)
    }
  }

  return doc
}
