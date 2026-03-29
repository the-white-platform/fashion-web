# Spec 12: Admin In-App Notifications

## Summary

In-app notification center for admin panel users — bell icon with unread count, notification list, read/unread state, and per-user preferences.

## Depends On

- Spec 01 (RBAC — roles determine who receives which notifications)

## New Collection: `notifications`

### New File: `src/collections/Notifications.ts`

| Field | Type | Description |
|-------|------|-------------|
| `recipient` | relationship (users) | Who receives this notification |
| `type` | select | new_order, order_status_change, low_stock, out_of_stock, return_request, new_user, new_form_submission |
| `title` | text | Short summary (e.g., "New order TW-1234") |
| `message` | text | Detail text |
| `link` | text | Admin panel URL to navigate to (e.g., `/admin/collections/orders/123`) |
| `read` | checkbox | Default false |
| `readAt` | date | When marked as read |
| `metadata` | json | Flexible payload (orderId, productId, etc.) |

**Admin config:**
- `useAsTitle`: title
- `defaultColumns`: type, title, read, createdAt
- `group`: { vi: 'Hệ thống', en: 'System' }
- `timestamps`: true

**Access:**
- read: own notifications only (filter by `recipient = req.user.id`)
- create: server-only (hooks create notifications, not users)
- update: own only (to mark as read)
- delete: admin only

## New Collection: `notification-preferences`

### New File: `src/collections/NotificationPreferences.ts`

One document per user. Fields:

| Field | Type | Description |
|-------|------|-------------|
| `user` | relationship (users), unique | The user |
| `inApp` | group | In-app notification toggles |
| `inApp.newOrder` | checkbox | Default true (admin/editor/staff) |
| `inApp.lowStock` | checkbox | Default true (admin/editor) |
| `inApp.returnRequest` | checkbox | Default true (admin/editor) |
| `inApp.newUser` | checkbox | Default false |
| `email` | group | Email notification toggles (for Spec 13) |
| `email.newOrder` | checkbox | Default true |
| `email.lowStock` | checkbox | Default false |
| `email.returnRequest` | checkbox | Default true |

**Access:** read/update own only, admin can read all.

## Notification Creation (Hooks)

Notifications are created by existing collection hooks. Add notification dispatch calls to:

| Trigger | Hook Location | Notification Type | Recipients |
|---------|--------------|-------------------|------------|
| New order created | `Orders.ts` afterChange | `new_order` | All admin + editor + staff |
| Low stock detected | `stockManagement.ts` | `low_stock` | Admin + editor |
| Out of stock | `stockManagement.ts` | `out_of_stock` | Admin + editor |
| Return requested | `Orders.ts` afterChange | `return_request` | Admin + editor |
| New user registered | `Users` afterChange | `new_user` | Admin only |

### New Utility: `src/utilities/createNotification.ts`

Helper function:
```
createNotification({ payload, type, title, message, link, metadata, recipientRoles })
```
- Queries users by role
- Checks each user's notification preferences
- Creates notification documents for eligible recipients

## Admin UI: Notification Bell

### New File: `src/admin/NotificationBell/index.tsx`

Client component added via `admin.components.afterNavLinks` (or header customization):

- Bell icon with unread count badge (red circle)
- Click opens dropdown panel showing latest 10 notifications
- Each item: icon by type, title, time ago, read/unread styling
- Click item -> mark as read + navigate to `link`
- "Mark all as read" button
- "View all" link to `/admin/collections/notifications`
- Polls `/api/notifications?where[read][equals]=false&where[recipient][equals]=me` every 30s

## Files

### New Files
- `src/collections/Notifications.ts`
- `src/collections/NotificationPreferences.ts`
- `src/utilities/createNotification.ts`
- `src/admin/NotificationBell/index.tsx`

### Modified Files
- `src/payload.config.ts` — register collections, add NotificationBell to admin components
- `src/collections/Orders.ts` — call createNotification on new order + return request
- `src/collections/Orders/hooks/stockManagement.ts` — call createNotification on low/out of stock
- `src/collections/Users/index.ts` — call createNotification on new user registration

## Verification

- Create an order -> admin users see notification in bell
- Product goes low stock -> editor sees notification
- Mark notification as read -> badge count decreases
- Disable a notification type in preferences -> verify it's not received
- Verify customer role cannot see notifications collection
