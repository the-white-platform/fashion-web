import type { CollectionAfterChangeHook } from 'payload'
import type { Order } from '@/payload-types'
import { createNotification } from '@/utilities/createNotification'

/**
 * After stock is decremented (post-order-create), re-read each product
 * and fire low-stock / out-of-stock notifications.
 *
 * This hook runs AFTER decrementStockAfterOrder, so stock levels are up to date.
 */
export const notifyOnStockChange: CollectionAfterChangeHook<Order> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const { payload } = req

  try {
    for (const item of doc.items ?? []) {
      const productId =
        typeof item.product === 'object' ? (item.product as { id: number }).id : item.product

      const product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 0,
      })

      if (!product?.colorVariants) continue

      for (const variant of product.colorVariants) {
        for (const inv of variant.sizeInventory ?? []) {
          const stock = inv.stock ?? 0
          const threshold = inv.lowStockThreshold ?? 5

          if (stock === 0) {
            await createNotification({
              payload,
              type: 'out_of_stock',
              title: 'Hết hàng',
              message: `${typeof product.name === 'string' ? product.name : ''} — ${variant.color} / ${inv.size} đã hết hàng`,
              link: `/admin/collections/products/${productId}`,
              metadata: {
                productId,
                variant: variant.color,
                size: inv.size,
              },
              recipientRoles: ['admin', 'editor'],
            })
          } else if (stock <= threshold) {
            await createNotification({
              payload,
              type: 'low_stock',
              title: 'Hàng sắp hết',
              message: `${typeof product.name === 'string' ? product.name : ''} — ${variant.color} / ${inv.size}: còn ${stock} sản phẩm`,
              link: `/admin/collections/products/${productId}`,
              metadata: {
                productId,
                variant: variant.color,
                size: inv.size,
                stock,
                threshold,
              },
              recipientRoles: ['admin', 'editor'],
            })
          }
        }
      }
    }
  } catch (error) {
    payload.logger.error(`[notifyOnStockChange] Error: ${error}`)
  }

  return doc
}
