import type { CollectionBeforeChangeHook } from 'payload'

interface ReturnItem {
  product: number | { id: number }
  variant?: string
  size?: string
  quantity: number
}

export const handleReturn: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || !originalDoc) return data

  const prevReturnStatus = originalDoc.returnRequest?.returnStatus
  const newReturnStatus = data.returnRequest?.returnStatus

  if (!newReturnStatus || newReturnStatus === prevReturnStatus) return data

  const userId = req.user?.id
  const now = new Date().toISOString()
  const existingLog =
    (data.activityLog as unknown[]) || (originalDoc.activityLog as unknown[]) || []

  if (newReturnStatus === 'received') {
    const returnItems = (data.returnRequest?.returnItems ||
      originalDoc.returnRequest?.returnItems ||
      []) as ReturnItem[]

    for (const item of returnItems) {
      const productId = typeof item.product === 'object' ? item.product.id : item.product

      try {
        const product = await req.payload.findByID({
          collection: 'products',
          id: productId,
          depth: 0,
        })

        if (!product?.colorVariants) continue

        const updatedVariants = product.colorVariants.map((variant) => {
          if (variant.color !== item.variant && variant.id !== item.variant) return variant

          const updatedSizeInventory = variant.sizeInventory?.map((sizeItem) => {
            if (sizeItem.size !== item.size) return sizeItem
            return { ...sizeItem, stock: sizeItem.stock + item.quantity }
          })

          return { ...variant, sizeInventory: updatedSizeInventory }
        })

        await req.payload.update({
          collection: 'products',
          id: productId,
          data: { colorVariants: updatedVariants },
        })

        req.payload.logger.info(
          `✓ Return stock restored: Product ${productId}, ${item.variant} ${item.size} (+${item.quantity})`,
        )
      } catch (error) {
        req.payload.logger.error(
          `Failed to restore return stock for product ${productId}: ${error}`,
        )
      }
    }

    data.activityLog = [
      ...existingLog,
      {
        action: 'return_requested',
        fromValue: prevReturnStatus,
        toValue: newReturnStatus,
        timestamp: now,
        performedBy: userId ?? null,
      },
    ]
  } else if (newReturnStatus === 'refunded') {
    data.status = 'refunded'
    if (!data.payment) data.payment = { ...(originalDoc.payment || {}) }
    data.payment.paymentStatus = 'refunded'

    data.activityLog = [
      ...existingLog,
      {
        action: 'refund',
        fromValue: prevReturnStatus,
        toValue: newReturnStatus,
        timestamp: now,
        performedBy: userId ?? null,
      },
    ]
  } else {
    data.activityLog = [
      ...existingLog,
      {
        action: 'return_requested',
        fromValue: prevReturnStatus,
        toValue: newReturnStatus,
        timestamp: now,
        performedBy: userId ?? null,
      },
    ]
  }

  return data
}
