# Spec 14: Push Notifications

## Summary

Browser push notifications via Web Push API for real-time alerts — new orders for admins, delivery updates for customers.

## Depends On

- Spec 12 (admin notifications — push extends the notification system)

## Architecture

Uses **Web Push API** (no Firebase dependency). Components:

1. **Service Worker** — receives and displays push messages
2. **Subscription management** — stores push subscriptions per user
3. **Server-side sending** — sends push via `web-push` library

## New Dependency

`web-push` — lightweight Web Push protocol library

## VAPID Keys

**New env vars:**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL` (contact email for push service)

Generate with: `npx web-push generate-vapid-keys`

## New Collection: `push-subscriptions`

### New File: `src/collections/PushSubscriptions.ts`

| Field | Type | Description |
|-------|------|-------------|
| `user` | relationship (users) | Subscriber |
| `endpoint` | text | Push service endpoint URL |
| `keys` | group | Auth keys |
| `keys.p256dh` | text | P256DH key |
| `keys.auth` | text | Auth secret |
| `userAgent` | text | Browser info (for debugging) |
| `active` | checkbox | Default true, set false on failure |

**Access:** create/read/update/delete own only.

**Admin config:**
- `group`: { vi: 'He thong', en: 'System' }
- Hidden from non-admin users in admin panel

## Service Worker

### New File: `public/sw-push.js`

Minimal service worker:
- `push` event listener — parse notification data, display via `self.registration.showNotification()`
- `notificationclick` event — open the `link` URL from notification data
- Notification format: `{ title, body, icon, link }`

## Client-Side Subscription

### New File: `src/utilities/pushSubscription.ts`

Client utility:
- `requestPushPermission()` — request Notification permission
- `subscribeToPush()` — register service worker, get PushSubscription, POST to `/api/push-subscriptions`
- `unsubscribeFromPush()` — remove subscription

### Integration Points

**Admin panel:** Add a "Enable Push Notifications" toggle in `NotificationPreferences` or in the NotificationBell dropdown.

**Customer storefront:** Optional opt-in prompt after first order (non-blocking).

## Server-Side Sending

### New File: `src/utilities/sendPushNotification.ts`

```
sendPushNotification({ payload, userId, title, body, link })
```

- Queries `push-subscriptions` for the user
- Sends via `web-push.sendNotification()`
- On 410 (Gone) response, marks subscription as `active: false`
- On failure, logs error but doesn't throw

### Integration with Notification System

Modify `src/utilities/createNotification.ts` (from Spec 12):
- After creating in-app notification, also call `sendPushNotification` for the same recipient
- Only if user has active push subscriptions

## Push Notification Triggers

### For Admins
| Event | Push Title | Push Body |
|-------|-----------|----------|
| New order | "Don hang moi #{orderNumber}" | Customer name, total |
| Low stock | "Sap het hang" | Product name, remaining stock |
| Return request | "Yeu cau tra hang" | Order number |

### For Customers
| Event | Push Title | Push Body |
|-------|-----------|----------|
| Order confirmed | "Don hang da xac nhan" | Order number |
| Order shipped | "Don hang dang giao" | Tracking number |
| Order delivered | "Don hang da giao" | Order number |

## Files

### New Files
- `src/collections/PushSubscriptions.ts`
- `public/sw-push.js`
- `src/utilities/pushSubscription.ts`
- `src/utilities/sendPushNotification.ts`

### Modified Files
- `src/payload.config.ts` — register PushSubscriptions collection
- `src/utilities/createNotification.ts` — add push sending
- `package.json` — add `web-push` dependency
- `.env.example` — add VAPID keys

## Verification

- Enable push in browser -> verify subscription created in collection
- Create an order -> admin receives browser push notification
- Change order to shipped -> customer receives push (if subscribed)
- Revoke browser permission -> verify subscription marked inactive on next send
- Test with multiple browser tabs -> notification appears once
