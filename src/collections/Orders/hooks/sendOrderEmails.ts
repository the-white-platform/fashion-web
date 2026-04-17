import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import type { Order } from '@/payload-types'
import { sendCustomerEmail } from '@/utilities/sendCustomerEmail'
import { sendZaloNotification } from '@/utilities/sendZaloNotification'

const DEFAULT_LOCALE: 'vi' | 'en' = 'vi'

/**
 * Resolve the locale to send the email in: prefer the linked user's
 * `preferredLocale`, else fall back to 'vi'. If the user is only a
 * reference ID (not a depth-populated object) we fetch it.
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
 * Try to send a Zalo ZNS notification if the customer has a Zalo user ID
 * and has opted in to Zalo notifications.
 */
async function maybeSendZalo(
  req: PayloadRequest,
  doc: Order,
  template: Parameters<typeof sendZaloNotification>[0]['template'],
) {
  try {
    const userRef = doc.customerInfo?.user
    if (!userRef) return

    const userId = typeof userRef === 'object' ? userRef.id : userRef
    const user = await req.payload.findByID({ collection: 'users', id: userId })

    if (user.zaloUserId && user.zaloNotifications) {
      const phone = doc.customerInfo?.customerPhone ?? user.phone
      if (phone) {
        await sendZaloNotification({ order: doc, template, phone })
      }
    }
  } catch (err) {
    req.payload.logger.error(`[sendOrderEmails/zalo] Error for order ${doc.orderNumber}: ${err}`)
  }
}

export const sendOrderEmails: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req
  const to = doc.customerInfo?.customerEmail

  if (!to) {
    payload.logger.warn(`[sendOrderEmails] No customer email on order ${doc.orderNumber}, skipping`)
    return doc
  }

  const locale = await resolveLocale(req, doc)

  try {
    // ── Order created ──────────────────────────────────────────────
    if (operation === 'create') {
      await sendCustomerEmail({
        payload,
        to,
        template: 'orderConfirmation',
        data: { order: doc, locale },
      })
      await maybeSendZalo(req, doc, 'orderConfirmation')
      return doc
    }

    const prevStatus = previousDoc?.status
    const newStatus = doc.status

    // ── Order status transitions ───────────────────────────────────
    if (prevStatus !== newStatus) {
      switch (newStatus) {
        case 'confirmed':
          await sendCustomerEmail({
            payload,
            to,
            template: 'orderStatusUpdate',
            data: { order: doc, locale },
          })
          await maybeSendZalo(req, doc, 'orderStatusUpdate')
          break

        case 'shipping':
          await sendCustomerEmail({
            payload,
            to,
            template: 'shippingNotification',
            data: { order: doc, locale },
          })
          await maybeSendZalo(req, doc, 'shippingNotification')
          break

        case 'delivered':
          await sendCustomerEmail({
            payload,
            to,
            template: 'deliveryConfirmation',
            data: { order: doc, locale },
          })
          await maybeSendZalo(req, doc, 'deliveryConfirmation')
          break

        case 'cancelled':
          await sendCustomerEmail({
            payload,
            to,
            template: 'orderStatusUpdate',
            data: { order: doc, locale },
          })
          await maybeSendZalo(req, doc, 'orderCancelled')
          break

        default:
          break
      }
    }

    // ── Payment status: refunded ───────────────────────────────────
    const prevPaymentStatus = previousDoc?.payment?.paymentStatus
    const newPaymentStatus = doc.payment?.paymentStatus

    if (prevPaymentStatus !== newPaymentStatus && newPaymentStatus === 'refunded') {
      await sendCustomerEmail({
        payload,
        to,
        template: 'refundNotification',
        data: { order: doc, locale },
      })
      await maybeSendZalo(req, doc, 'refundNotification')
    }
  } catch (err) {
    // Non-fatal: log and continue so the order save is not blocked
    payload.logger.error(
      `[sendOrderEmails] Unexpected error for order ${doc.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return doc
}
