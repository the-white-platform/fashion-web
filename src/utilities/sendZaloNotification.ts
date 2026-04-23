import { zaloSendZNS } from '@/lib/zalo'
import type { Order } from '@/payload-types'
import {
  statusFromZnsResult,
  writeZaloDeliveryStatus,
  writeZaloDeliveryStatusByPhone,
} from './updateZaloDeliveryStatus'

/**
 * ZNS template IDs — configure via environment variables or constants.
 * These IDs are registered in the Zalo OA dashboard.
 */
// All six logical template keys map to the single template ID that
// exists on the Zalo dashboard (ID 569406 / ORDER_STATUS). The enum
// key names are preserved so callers don't need to change.
const ZNS_TEMPLATES = {
  orderConfirmation: process.env.ZALO_ZNS_ORDER_STATUS ?? '',
  orderStatusUpdate: process.env.ZALO_ZNS_ORDER_STATUS ?? '',
  shippingNotification: process.env.ZALO_ZNS_ORDER_STATUS ?? '',
  deliveryConfirmation: process.env.ZALO_ZNS_ORDER_STATUS ?? '',
  orderCancelled: process.env.ZALO_ZNS_ORDER_STATUS ?? '',
  refundNotification: process.env.ZALO_ZNS_ORDER_STATUS ?? '',
}

type ZNSTemplate = keyof typeof ZNS_TEMPLATES

interface SendZaloNotificationOptions {
  order: Order
  template: ZNSTemplate
  phone: string
}

function formatOrderData(order: Order): Record<string, string> {
  // Keys must match the parameter names in the Zalo ZNS template
  // exactly (Zalo rejects the send on unknown keys). Current
  // template schema (ID 569406, orderConfirmation):
  //   order_code, date, price, name, phone_number,
  //   product_info, status
  const total = order.totals?.total ?? 0
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date()
  const items = (order.items ?? []) as Array<{
    productName?: string | null
    variant?: string | null
    size?: string | null
    quantity?: number | null
  }>
  const productInfo =
    items.length > 0
      ? items
          .map((i) => {
            const name = i.productName || ''
            const variant =
              i.variant || i.size ? ` (${[i.variant, i.size].filter(Boolean).join(' / ')})` : ''
            const qty = i.quantity ? ` x${i.quantity}` : ''
            return `${name}${variant}${qty}`
          })
          .filter(Boolean)
          .join(', ')
      : ''

  return {
    order_code: order.orderNumber ?? String(order.id),
    date: createdAt.toLocaleDateString('vi-VN'),
    // ZNS template `price` is a number type in Zalo's test JSON;
    // send as string but without currency symbol so the template
    // can format it.
    price: String(total),
    name: order.customerInfo?.customerName ?? '',
    phone_number: order.customerInfo?.customerPhone ?? '',
    product_info: productInfo,
    status: order.status ?? '',
  }
}

/**
 * Send a Zalo ZNS notification for an order event.
 * Returns `true` only if Zalo accepted the send (`error: 0`).
 * Returns `false` for any skip/failure so callers can fall back
 * to the next channel (email / SMS). Never throws.
 */
export async function sendZaloNotification({
  order,
  template,
  phone,
}: SendZaloNotificationOptions): Promise<boolean> {
  const templateId = ZNS_TEMPLATES[template]

  if (!templateId) {
    console.info(`[sendZaloNotification] Skip "${template}" — template id not configured`)
    return false
  }

  // Normalize phone: remove leading 0, add +84
  const normalizedPhone = phone.startsWith('0') ? `84${phone.slice(1)}` : phone.replace(/^\+/, '')

  try {
    const result = await zaloSendZNS({
      phone: normalizedPhone,
      templateId,
      templateData: formatOrderData(order),
      trackingId: `order-${order.id}-${template}`,
    })
    const derived = statusFromZnsResult(result)
    if (derived) {
      const userRef = order.customerInfo?.user
      const userId =
        userRef && typeof userRef === 'object' ? (userRef as { id: string | number }).id : userRef
      if (userId !== null && userId !== undefined) {
        await writeZaloDeliveryStatus(userId, derived)
      } else {
        await writeZaloDeliveryStatusByPhone(phone, derived)
      }
    }
    if (result.ok) {
      console.info(
        `[sendZaloNotification] Sent "${template}" to ${normalizedPhone} (order ${order.orderNumber ?? order.id})`,
      )
      return true
    }
    console.warn(
      `[sendZaloNotification] Zalo rejected "${template}" for ${normalizedPhone}: error=${result.errorCode} ${result.errorMessage}`,
    )
    return false
  } catch (err) {
    console.error(`[sendZaloNotification] Failed to send ZNS (${template}):`, err)
    return false
  }
}
