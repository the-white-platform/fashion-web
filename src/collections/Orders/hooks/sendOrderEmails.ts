import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import type { Order } from '@/payload-types'
import {
  sendOrderNotification,
  type OrderNotificationEvent,
} from '@/utilities/sendOrderNotification'

const DEFAULT_LOCALE: 'vi' | 'en' = 'vi'

/**
 * Resolve the notification locale: prefer the linked user's
 * `preferredLocale`, else fall back to `vi`. If the user ref is a
 * bare ID (depth 0) we fetch it.
 */
const resolveLocale = async (req: PayloadRequest, order: Order): Promise<'vi' | 'en'> => {
  const userRef = order.customerInfo?.user
  if (!userRef) return DEFAULT_LOCALE
  try {
    if (typeof userRef === 'object' && userRef !== null) {
      const pref = (userRef as { preferredLocale?: 'vi' | 'en' }).preferredLocale
      if (pref === 'en' || pref === 'vi') return pref
    }
    const userId = typeof userRef === 'object' ? (userRef as { id: number | string }).id : userRef
    const user = await req.payload.findByID({ collection: 'users', id: userId, depth: 0 })
    const pref = (user as { preferredLocale?: 'vi' | 'en' }).preferredLocale
    return pref === 'en' || pref === 'vi' ? pref : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

/**
 * Fire exactly one customer notification per order event via
 * `sendOrderNotification`, which picks the cheapest available
 * channel (Zalo → Email → SMS) and stops at the first success.
 *
 * Kept named `sendOrderEmails` to match the existing hook
 * registration in `Orders.ts` — in practice it now dispatches
 * across all three channels.
 */
export const sendOrderEmails: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req
  const locale = await resolveLocale(req, doc)

  const notify = (event: OrderNotificationEvent) =>
    sendOrderNotification({ req, order: doc, event, locale })

  try {
    if (operation === 'create') {
      await notify('created')
      return doc
    }

    const prevStatus = previousDoc?.status
    const newStatus = doc.status

    if (prevStatus !== newStatus) {
      switch (newStatus) {
        case 'confirmed':
          await notify('confirmed')
          break
        case 'shipping':
          await notify('shipping')
          break
        case 'delivered':
          await notify('delivered')
          break
        case 'cancelled':
          await notify('cancelled')
          break
        default:
          break
      }
    }

    const prevPaymentStatus = previousDoc?.payment?.paymentStatus
    const newPaymentStatus = doc.payment?.paymentStatus

    if (prevPaymentStatus !== newPaymentStatus && newPaymentStatus === 'refunded') {
      await notify('refunded')
    }
  } catch (err) {
    // Non-fatal: log and continue so the order save is not blocked.
    payload.logger.error(
      `[sendOrderEmails] Unexpected error for order ${doc.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return doc
}
