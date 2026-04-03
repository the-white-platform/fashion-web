import type { Payload } from 'payload'

type NotificationType =
  | 'new_order'
  | 'order_status_change'
  | 'low_stock'
  | 'out_of_stock'
  | 'return_request'
  | 'new_user'
  | 'new_form_submission'

type RecipientRole = 'admin' | 'editor' | 'staff' | 'customer'

interface CreateNotificationOptions {
  payload: Payload
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
  recipientRoles?: RecipientRole[]
  recipientIds?: number[]
}

// Map notification type to preference key
const typeToPreferenceKey: Partial<
  Record<NotificationType, 'newOrder' | 'lowStock' | 'returnRequest' | 'newUser'>
> = {
  new_order: 'newOrder',
  order_status_change: 'newOrder',
  low_stock: 'lowStock',
  out_of_stock: 'lowStock',
  return_request: 'returnRequest',
  new_user: 'newUser',
}

export async function createNotification({
  payload,
  type,
  title,
  message,
  link,
  metadata,
  recipientRoles = ['admin', 'editor'],
  recipientIds,
}: CreateNotificationOptions): Promise<void> {
  try {
    let targetUserIds: number[] = recipientIds ?? []

    // If no explicit IDs, query by role
    if (!recipientIds) {
      const result = await payload.find({
        collection: 'users',
        where: {
          role: { in: recipientRoles },
        },
        limit: 100,
        pagination: false,
      })
      targetUserIds = result.docs.map((u) => u.id as number)
    }

    const preferenceKey = typeToPreferenceKey[type]

    for (const userId of targetUserIds) {
      // Check notification preferences if applicable
      if (preferenceKey) {
        try {
          const prefResult = await payload.find({
            collection: 'notification-preferences',
            where: { user: { equals: userId } },
            limit: 1,
          })
          const prefs = prefResult.docs[0]
          // If prefs exist and the inApp preference for this type is explicitly false, skip
          if (
            prefs &&
            prefs.inApp &&
            (prefs.inApp as Record<string, boolean>)[preferenceKey] === false
          ) {
            continue
          }
        } catch {
          // No preferences record — default to sending
        }
      }

      await payload.create({
        collection: 'notifications',
        data: {
          recipient: userId,
          type,
          title,
          message,
          link: link ?? '',
          read: false,
          metadata: metadata ?? null,
        },
      })
    }

    // Send push notifications
    await sendPushToRecipients({ payload, userIds: targetUserIds, type, title, message, link })
  } catch (error) {
    payload.logger.error(`[createNotification] Failed: ${error}`)
  }
}

async function sendPushToRecipients({
  payload,
  userIds,
  type,
  title,
  message,
  link,
}: {
  payload: Payload
  userIds: number[]
  type: NotificationType
  title: string
  message: string
  link?: string
}): Promise<void> {
  if (userIds.length === 0) return

  try {
    const { sendPushNotification } = await import('./sendPushNotification')

    for (const userId of userIds) {
      const subResult = await payload.find({
        collection: 'push-subscriptions',
        where: {
          user: { equals: userId },
          active: { equals: true },
        },
        limit: 10,
      })

      for (const sub of subResult.docs) {
        await sendPushNotification({
          payload,
          subscription: {
            id: sub.id as number,
            endpoint: sub.endpoint,
            keys: {
              p256dh: (sub.keys as { p256dh: string; auth: string }).p256dh,
              auth: (sub.keys as { p256dh: string; auth: string }).auth,
            },
          },
          title,
          body: message,
          data: { type, link },
        })
      }
    }
  } catch {
    // Push is non-fatal
  }
}
