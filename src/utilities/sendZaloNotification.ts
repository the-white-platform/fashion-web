import { zaloSendZNS } from '@/lib/zalo'
import type { Order } from '@/payload-types'

/**
 * ZNS template IDs — configure via environment variables or constants.
 * These IDs are registered in the Zalo OA dashboard.
 */
const ZNS_TEMPLATES = {
  orderConfirmation: process.env.ZALO_ZNS_ORDER_CONFIRMATION ?? '',
  orderStatusUpdate: process.env.ZALO_ZNS_ORDER_STATUS ?? '',
  shippingNotification: process.env.ZALO_ZNS_SHIPPING ?? '',
  deliveryConfirmation: process.env.ZALO_ZNS_DELIVERY ?? '',
  orderCancelled: process.env.ZALO_ZNS_CANCELLED ?? '',
  refundNotification: process.env.ZALO_ZNS_REFUND ?? '',
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
 * Silently skips if Zalo is not configured or template ID is missing.
 */
export async function sendZaloNotification({
  order,
  template,
  phone,
}: SendZaloNotificationOptions): Promise<void> {
  const templateId = ZNS_TEMPLATES[template]

  if (!templateId) {
    // Not configured — skip silently
    return
  }

  // Normalize phone: remove leading 0, add +84
  const normalizedPhone = phone.startsWith('0') ? `84${phone.slice(1)}` : phone.replace(/^\+/, '')

  try {
    await zaloSendZNS({
      phone: normalizedPhone,
      templateId,
      templateData: formatOrderData(order),
      trackingId: `order-${order.id}-${template}`,
    })
  } catch (err) {
    // Non-fatal — log but don't throw
    console.error(`[sendZaloNotification] Failed to send ZNS (${template}):`, err)
  }
}
