import type { PayloadRequest } from 'payload'
import type { Order, User } from '@/payload-types'
import { sendZaloNotification } from './sendZaloNotification'
import { sendCustomerEmail } from './sendCustomerEmail'
import { isSyntheticEmail } from '@/lib/identity'

/**
 * Unified order-notification event. One event, one send — Zalo
 * first (phone, any Zalo-registered number), email second. Zalo
 * ZNS is the primary channel (doubles as our SMS — Vietnam
 * customers almost universally have Zalo). Email is the fallback
 * for customers whose phone isn't on Zalo.
 */
export type OrderNotificationEvent =
  | 'created'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

type Channel = 'zalo' | 'email' | 'none'

type ZnsTemplate = Parameters<typeof sendZaloNotification>[0]['template']
type EmailTemplate =
  | 'orderConfirmation'
  | 'orderStatusUpdate'
  | 'shippingNotification'
  | 'deliveryConfirmation'
  | 'refundNotification'

const ZNS_TEMPLATE_BY_EVENT: Record<OrderNotificationEvent, ZnsTemplate> = {
  created: 'orderConfirmation',
  confirmed: 'orderStatusUpdate',
  shipping: 'shippingNotification',
  delivered: 'deliveryConfirmation',
  cancelled: 'orderCancelled',
  refunded: 'refundNotification',
}

// `orderCancelled` reuses the generic status-update email; there
// is no dedicated cancellation template on the email side today.
const EMAIL_TEMPLATE_BY_EVENT: Record<OrderNotificationEvent, EmailTemplate> = {
  created: 'orderConfirmation',
  confirmed: 'orderStatusUpdate',
  shipping: 'shippingNotification',
  delivered: 'deliveryConfirmation',
  cancelled: 'orderStatusUpdate',
  refunded: 'refundNotification',
}

interface SendOrderNotificationArgs {
  req: PayloadRequest
  order: Order
  event: OrderNotificationEvent
  locale: 'vi' | 'en'
}

async function resolveUser(req: PayloadRequest, order: Order): Promise<User | null> {
  const userRef = order.customerInfo?.user
  if (!userRef) return null
  try {
    if (typeof userRef === 'object' && userRef !== null && 'id' in userRef) {
      return userRef as User
    }
    const userId = typeof userRef === 'object' ? (userRef as { id: number | string }).id : userRef
    return (await req.payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    })) as User | null
  } catch {
    return null
  }
}

/**
 * Fire exactly one notification per order event.
 *
 * Priority:
 *   1. Zalo ZNS — if we have a phone, user hasn't opted out, and
 *      the phone is on Zalo. ZNS rejects with `error: -124` /
 *      `-129` when the phone isn't on Zalo; `sendZaloNotification`
 *      surfaces that as `false` so we fall through to email.
 *   2. Email — if we have a real (non-synthetic) email address.
 *      Synthetic placeholders (`@phone.thewhite.cool`,
 *      `@zalo.thewhite.cool`) hard-bounce and are skipped.
 *
 * Zalo doubles as the SMS channel in VN — almost every mobile
 * number is on Zalo, so a dedicated SMS provider would be pure
 * cost with zero delivery gain. If a customer has neither Zalo
 * nor a real email, we log `channel=none` and move on.
 *
 * Return value is the channel that actually delivered (or `none`).
 * Never throws — notification failures must not block order saves.
 */
export async function sendOrderNotification({
  req,
  order,
  event,
  locale,
}: SendOrderNotificationArgs): Promise<Channel> {
  const { payload } = req
  const orderKey = order.orderNumber ?? order.id
  const phone = order.customerInfo?.customerPhone?.trim() || ''
  const email = order.customerInfo?.customerEmail?.trim() || ''
  const user = await resolveUser(req, order)
  const zaloOptedIn = user?.zaloNotifications !== false

  // 1. Zalo ZNS
  if (phone && zaloOptedIn) {
    try {
      const sent = await sendZaloNotification({
        order,
        template: ZNS_TEMPLATE_BY_EVENT[event],
        phone,
      })
      if (sent) {
        payload.logger.info(`[orderNotify] order=${orderKey} event=${event} channel=zalo`)
        return 'zalo'
      }
    } catch (err) {
      payload.logger.error(
        `[orderNotify] Zalo step threw for order ${orderKey}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  // 2. Email
  if (email && !isSyntheticEmail(email)) {
    const sent = await sendCustomerEmail({
      payload,
      to: email,
      template: EMAIL_TEMPLATE_BY_EVENT[event],
      data: { order, locale },
    })
    if (sent) {
      payload.logger.info(`[orderNotify] order=${orderKey} event=${event} channel=email`)
      return 'email'
    }
  }

  payload.logger.warn(
    `[orderNotify] order=${orderKey} event=${event} — no channel delivered (phone=${phone ? 'yes' : 'no'}, email=${email ? (isSyntheticEmail(email) ? 'synthetic' : 'yes') : 'no'})`,
  )
  return 'none'
}
