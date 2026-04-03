'use client'

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return null
  }

  const permission = await requestPushPermission()
  if (permission !== 'granted') return null

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey) {
    console.warn('[pushSubscription] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-push.js')
    await navigator.serviceWorker.ready

    const existing = await registration.pushManager.getSubscription()
    if (existing) return existing

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Cast to ArrayBuffer to satisfy TypeScript's BufferSource constraint
      applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
    })

    // Save to server
    const subJson = sub.toJSON()
    await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        userAgent: navigator.userAgent,
      }),
    })

    return sub
  } catch (error) {
    console.error('[pushSubscription] Failed to subscribe:', error)
    return null
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw-push.js')
    if (!registration) return

    const sub = await registration.pushManager.getSubscription()
    if (!sub) return

    const endpoint = sub.endpoint
    await sub.unsubscribe()

    // Mark inactive on server
    await fetch('/api/push-subscriptions/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ endpoint }),
    })
  } catch (error) {
    console.error('[pushSubscription] Failed to unsubscribe:', error)
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
