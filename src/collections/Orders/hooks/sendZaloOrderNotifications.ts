import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import type { Order, User } from '@/payload-types'
import { sendZaloNotification } from '@/utilities/sendZaloNotification'

/**
 * Fire a Zalo ZNS notification when an order moves to a status the
 * customer cares about (currently `confirmed` and `shipping`).
 *
 * ZNS unlike the OA Free Message API does NOT require the customer
 * to have followed the OA — it delivers to any Zalo-registered
 * phone using a pre-approved template. So this hook only needs:
 *
 *  - The order has a customerPhone (or the linked user has a phone).
 *  - The user hasn't actively opted out via `zaloNotifications: false`.
 *
 * Skip without throwing if Zalo isn't configured (template id or
 * refresh token missing). The order save must never fail because of
 * a notification side-effect.
 */
async function maybeSendZalo(
  req: PayloadRequest,
  doc: Order,
  template: Parameters<typeof sendZaloNotification>[0]['template'],
): Promise<void> {
  try {
    const phone = doc.customerInfo?.customerPhone?.trim()
    if (!phone) return

    const userRef = doc.customerInfo?.user
    if (userRef) {
      // Honor explicit opt-out only. New users (zaloNotifications=true
      // by default) and anonymous orders both get notifications.
      const userId = typeof userRef === 'object' ? userRef.id : userRef
      const user = (await req.payload.findByID({ collection: 'users', id: userId })) as User | null
      if (user?.zaloNotifications === false) return
    }

    await sendZaloNotification({ order: doc, template, phone })
  } catch (err) {
    req.payload.logger.error(
      `[sendZaloOrderNotifications] Failed for order ${doc.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

export const sendZaloOrderNotifications: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Status-transition only — do nothing on `create` or on saves that
  // don't change status.
  if (operation !== 'update') return doc
  const prevStatus = previousDoc?.status
  const newStatus = doc.status
  if (prevStatus === newStatus) return doc

  if (newStatus === 'confirmed') {
    await maybeSendZalo(req, doc, 'orderConfirmation')
  } else if (newStatus === 'shipping') {
    await maybeSendZalo(req, doc, 'shippingNotification')
  }

  return doc
}
