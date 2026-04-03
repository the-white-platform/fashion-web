import webpush from 'web-push'
import type { Payload } from 'payload'

interface PushSubscription {
  id: number
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface SendPushOptions {
  payload: Payload
  subscription: PushSubscription
  title: string
  body: string
  data?: Record<string, unknown>
  icon?: string
  badge?: string
}

// Initialize VAPID keys lazily (set once per process)
let vapidInitialized = false

function ensureVapid() {
  if (vapidInitialized) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL ?? 'mailto:admin@thewhite.vn'

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars.',
    )
  }

  webpush.setVapidDetails(email, publicKey, privateKey)
  vapidInitialized = true
}

export async function sendPushNotification({
  payload,
  subscription,
  title,
  body,
  data,
  icon = '/icon-192.png',
  badge = '/badge-72.png',
}: SendPushOptions): Promise<void> {
  try {
    ensureVapid()
  } catch {
    // VAPID not configured — skip silently
    return
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  }

  const notificationPayload = JSON.stringify({ title, body, icon, badge, data })

  try {
    await webpush.sendNotification(pushSubscription, notificationPayload)
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 410 || statusCode === 404) {
      // Subscription is no longer valid — mark as inactive
      try {
        await payload.update({
          collection: 'push-subscriptions',
          id: subscription.id,
          data: { active: false },
        })
        payload.logger.info(
          `[sendPushNotification] Subscription ${subscription.id} marked inactive (${statusCode})`,
        )
      } catch (updateError) {
        payload.logger.error(
          `[sendPushNotification] Failed to deactivate subscription ${subscription.id}: ${updateError}`,
        )
      }
    } else {
      payload.logger.error(
        `[sendPushNotification] Failed to send to ${subscription.endpoint}: ${error}`,
      )
    }
  }
}
