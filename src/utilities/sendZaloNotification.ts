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
  const total = order.totals?.total?.toLocaleString('vi-VN') ?? '0'
  return {
    order_number: order.orderNumber ?? String(order.id),
    customer_name: order.customerInfo?.customerName ?? '',
    total: `${total}₫`,
    status: order.status ?? '',
    created_at: new Date(order.createdAt).toLocaleDateString('vi-VN'),
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
