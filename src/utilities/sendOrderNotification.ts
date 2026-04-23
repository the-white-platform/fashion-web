import type { PayloadRequest } from 'payload'
import type { Order, User } from '@/payload-types'
import { sendZaloNotification } from './sendZaloNotification'
import { sendCustomerEmail } from './sendCustomerEmail'
import { sendSMS } from './sendSMS'
import { isSyntheticEmail } from '@/lib/identity'

/**
 * Unified order-notification event. One event, one send — Zalo
 * first (by phone), email second, SMS last. The first channel to
 * succeed wins; the others are skipped so we pay for at most one
 * delivery per transition.
 */
export type OrderNotificationEvent =
  | 'created'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

type Channel = 'zalo' | 'email' | 'sms' | 'none'

type ZnsTemplate = Parameters<typeof sendZaloNotification>[0]['template']
type EmailTemplate =
  | 'orderConfirmation'
  | 'orderStatusUpdate'
  | 'shippingNotification'
  | 'deliveryConfirmation'
  | 'refundNotification'
type SmsTemplate = Parameters<typeof sendSMS>[0]['template']

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

const SMS_TEMPLATE_BY_EVENT: Record<OrderNotificationEvent, SmsTemplate> = {
  created: 'orderConfirmation',
  confirmed: 'orderStatusUpdate',
  shipping: 'shippingNotification',
  delivered: 'deliveryConfirmation',
  cancelled: 'orderCancelled',
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
 *      `-129` when the phone isn't on Zalo, which `sendZaloNotification`
 *      surfaces as `false` so we fall through to email.
 *   2. Email — if we have a real (non-synthetic) email address.
 *      Synthetic placeholders (`@phone.thewhite.cool`,
 *      `@zalo.thewhite.cool`) hard-bounce and must be skipped.
 *   3. SMS — last resort. No provider wired yet; always returns
 *      false today and the event is logged as `none`.
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

  // 3. SMS
  if (phone) {
    const sent = await sendSMS({
      payload,
      phone,
      order,
      template: SMS_TEMPLATE_BY_EVENT[event],
      locale,
    })
    if (sent) {
      payload.logger.info(`[orderNotify] order=${orderKey} event=${event} channel=sms`)
      return 'sms'
    }
  }

  payload.logger.warn(
    `[orderNotify] order=${orderKey} event=${event} — no channel delivered (phone=${phone ? 'yes' : 'no'}, email=${email ? (isSyntheticEmail(email) ? 'synthetic' : 'yes') : 'no'})`,
  )
  return 'none'
}
